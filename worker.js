/**
 * PhotoSplit Studio — Web Worker
 * Handles CPU-intensive image analysis off the main thread.
 * Receives: { type, imageData, options }
 * Sends back: { type, result }
 */

'use strict';

self.onmessage = function (e) {
  const { type, imageData, options } = e.data;

  switch (type) {
    case 'DETECT_PHOTOS':
      try {
        const boxes = detectPhotos(imageData, options);
        self.postMessage({ type: 'DETECT_DONE', boxes });
      } catch (err) {
        self.postMessage({ type: 'ERROR', message: err.message });
      }
      break;

    case 'STRAIGHTEN_ANALYZE':
      try {
        const angle = detectAngle(imageData, options);
        self.postMessage({ type: 'STRAIGHTEN_DONE', angle });
      } catch (err) {
        self.postMessage({ type: 'ERROR', message: err.message });
      }
      break;

    default:
      self.postMessage({ type: 'ERROR', message: 'Unknown worker task: ' + type });
  }
};

/* ─── PHOTO DETECTION ─────────────────────────────────────────────────────── */

/**
 * detectPhotos — Robust dual-method detection:
 *
 * Method A (primary): Direct background segmentation.
 *   A pixel is "scanner background" if it is both bright (luma >= bgThreshold)
 *   AND near-neutral in colour (max_channel - min_channel < neutralTolerance).
 *   This reliably identifies scanner glass/paper even when photo edges are faint.
 *
 * Method B (supplement): Sobel edge detection at a fixed low threshold.
 *   Adds any strong edge pixels that Method A might miss — e.g. a dark photo
 *   border on an off-white scanner lid, or a photo with an unusually bright edge.
 *
 * Combined foreground mask → adaptive dilation (scales with image size) →
 * morphological closing to fill photo interiors → connected components →
 * bounding boxes → overlap merge.
 */
function detectPhotos(imageData, opts = {}) {
  const { width, height, data } = imageData;
  const {
    bgThreshold  = 240,    // Brightness above which a near-neutral pixel = background
    minAreaRatio = 0.005,  // Minimum photo area as fraction of total scan area
    padding      = 10,     // Extra padding added around each detected box (px)
  } = opts;

  // Neutral-colour tolerance: scanner glass reflects nearly pure white/grey.
  // Photos always have some colour or texture variance.
  const neutralTolerance = 35;

  // Adaptive dilation radius: grows with image size so it can bridge large
  // photo interiors. ~1.5 % of the shorter dimension, clamped 12–80 px.
  const dilateRadius = Math.max(12, Math.min(80,
    Math.round(Math.min(width, height) * 0.015)
  ));

  self.postMessage({ type: 'PROGRESS', value: 5, label: 'Segmenting background…' });

  /* ── Step 1: Build grayscale + foreground mask ─────────────────────────── */
  const gray = new Uint8Array(width * height);
  const mask = new Uint8Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) | 0;

    // Background pixel: bright AND near-neutral (low saturation)
    const lo = r < g ? (r < b ? r : b) : (g < b ? g : b);
    const hi = r > g ? (r > b ? r : b) : (g > b ? g : b);
    const isBackground = (gray[i] >= bgThreshold) && ((hi - lo) < neutralTolerance);
    mask[i] = isBackground ? 0 : 1;   // 1 = foreground candidate
  }

  self.postMessage({ type: 'PROGRESS', value: 18, label: 'Supplementing with edge detection…' });

  /* ── Step 2: Sobel supplement — adds thin photo borders missed by threshold ─ */
  // Fixed low threshold so we catch any significant gradient near a photo edge.
  const edgeSuppThresh = 28;
  for (let y = 1; y < height - 1; y++) {
    let off = y * width + 1;
    for (let x = 1; x < width - 1; x++, off++) {
      if (mask[off]) continue;   // Already foreground — skip
      const p00 = gray[off - width - 1], p01 = gray[off - width], p02 = gray[off - width + 1];
      const p10 = gray[off - 1],                                   p12 = gray[off + 1];
      const p20 = gray[off + width - 1], p21 = gray[off + width], p22 = gray[off + width + 1];
      const gx = p02 - p00 + 2 * (p12 - p10) + p22 - p20;
      const gy = p20 - p00 + 2 * (p21 - p01) + p22 - p02;
      const mag = (gx < 0 ? -gx : gx) + (gy < 0 ? -gy : gy);
      if (mag > edgeSuppThresh) mask[off] = 1;
    }
  }

  self.postMessage({ type: 'PROGRESS', value: 32, label: 'Dilating foreground regions…' });

  /* ── Step 3: Morphological CLOSE = dilate then erode ──────────────────── */
  // Dilation fills the interior of each photo and bridges small gaps between
  // nearby photo-content pixels.  Erosion afterwards removes noise halos.
  const dilated = dilate(mask, width, height, dilateRadius);

  // Light erosion with a smaller radius to remove thin background-noise halos
  // while keeping the filled photo bodies intact.
  const erodeRadius = Math.max(4, Math.round(dilateRadius * 0.35));
  const closed = erode(dilated, width, height, erodeRadius);

  self.postMessage({ type: 'PROGRESS', value: 55, label: 'Finding connected regions…' });

  /* ── Step 4: Connected-component labelling (union-find) ─────────────────── */
  const labels = labelComponents(closed, width, height);

  self.postMessage({ type: 'PROGRESS', value: 70, label: 'Computing bounding boxes…' });

  /* ── Step 5: Bounding box per label ────────────────────────────────────── */
  const bboxMap = Object.create(null);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const lbl = labels[y * width + x];
      if (!lbl) continue;
      let b = bboxMap[lbl];
      if (!b) { bboxMap[lbl] = b = { minX: x, minY: y, maxX: x, maxY: y }; }
      if (x < b.minX) b.minX = x;
      if (y < b.minY) b.minY = y;
      if (x > b.maxX) b.maxX = x;
      if (y > b.maxY) b.maxY = y;
    }
  }

  self.postMessage({ type: 'PROGRESS', value: 84, label: 'Filtering regions…' });

  /* ── Step 6: Filter by area and aspect ratio ───────────────────────────── */
  const totalPixels = width * height;
  const minArea = totalPixels * minAreaRatio;
  const maxArea = totalPixels * 0.92;   // Ignore boxes covering >92% (scanner frame)

  const boxes = [];
  for (const lbl in bboxMap) {
    const b = bboxMap[lbl];
    const bw = b.maxX - b.minX;
    const bh = b.maxY - b.minY;
    const area = bw * bh;
    if (area < minArea || area > maxArea) continue;

    // Reject very thin strips — likely scanner border artefacts
    const aspect = bw / (bh || 1);
    if (aspect > 12 || aspect < 0.083) continue;

    boxes.push({
      x: Math.max(0, b.minX - padding),
      y: Math.max(0, b.minY - padding),
      w: Math.min(width,  b.maxX + padding) - Math.max(0, b.minX - padding),
      h: Math.min(height, b.maxY + padding) - Math.max(0, b.minY - padding),
    });
  }

  self.postMessage({ type: 'PROGRESS', value: 94, label: 'Merging overlapping boxes…' });

  /* ── Step 7: Merge any boxes that overlap or are adjacent ─────────────── */
  const merged = mergeOverlapping(boxes, width, height);

  self.postMessage({ type: 'PROGRESS', value: 100, label: 'Detection complete' });

  return merged;
}

/* ─── MORPHOLOGICAL DILATION ─────────────────────────────────────────────── */
// Separable (row then column) for O(n) instead of O(n·r²).

function dilate(mask, width, height, radius) {
  const tmp = new Uint8Array(width * height);
  const out = new Uint8Array(width * height);

  // Row pass
  for (let y = 0; y < height; y++) {
    const rowOff = y * width;
    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      let found = false;
      for (let nx = x0; nx <= x1; nx++) {
        if (mask[rowOff + nx]) { found = true; break; }
      }
      tmp[rowOff + x] = found ? 1 : 0;
    }
  }

  // Column pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(height - 1, y + radius);
      let found = false;
      for (let ny = y0; ny <= y1; ny++) {
        if (tmp[ny * width + x]) { found = true; break; }
      }
      out[y * width + x] = found ? 1 : 0;
    }
  }

  return out;
}

/* ─── MORPHOLOGICAL EROSION ──────────────────────────────────────────────── */
// Separable erosion to remove thin noise halos after dilation (= closing).

function erode(mask, width, height, radius) {
  const tmp = new Uint8Array(width * height);
  const out = new Uint8Array(width * height);

  // Row pass — a pixel survives only if the whole [x-r .. x+r] run is set
  for (let y = 0; y < height; y++) {
    const rowOff = y * width;
    for (let x = 0; x < width; x++) {
      if (!mask[rowOff + x]) { tmp[rowOff + x] = 0; continue; }
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      let allSet = true;
      for (let nx = x0; nx <= x1; nx++) {
        if (!mask[rowOff + nx]) { allSet = false; break; }
      }
      tmp[rowOff + x] = allSet ? 1 : 0;
    }
  }

  // Column pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (!tmp[y * width + x]) { out[y * width + x] = 0; continue; }
      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(height - 1, y + radius);
      let allSet = true;
      for (let ny = y0; ny <= y1; ny++) {
        if (!tmp[ny * width + x]) { allSet = false; break; }
      }
      out[y * width + x] = allSet ? 1 : 0;
    }
  }

  return out;
}

/* ─── UNION-FIND (CONNECTED COMPONENTS) ─────────────────────────────────── */

function labelComponents(mask, width, height) {
  const parent = new Int32Array(width * height);
  const labels = new Int32Array(width * height);

  for (let i = 0; i < parent.length; i++) parent[i] = i;

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];   // Path compression
      x = parent[x];
    }
    return x;
  }

  function union(a, b) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }

  // First pass — connect 4-neighbours
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!mask[idx]) continue;
      if (x > 0 && mask[idx - 1])     union(idx, idx - 1);
      if (y > 0 && mask[idx - width]) union(idx, idx - width);
    }
  }

  // Second pass — assign canonical labels
  let nextLabel = 1;
  const rootToLabel = Object.create(null);
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) { labels[i] = 0; continue; }
    const root = find(i);
    if (rootToLabel[root] === undefined) rootToLabel[root] = nextLabel++;
    labels[i] = rootToLabel[root];
  }

  return labels;
}

/* ─── MERGE OVERLAPPING BOXES ────────────────────────────────────────────── */

function mergeOverlapping(boxes, width, height) {
  if (boxes.length === 0) return [];

  // Use a proximity margin so boxes that are very close but not touching merge.
  const MERGE_MARGIN = 8;

  let changed = true;
  while (changed) {
    changed = false;
    const used = new Array(boxes.length).fill(false);
    const merged = [];

    for (let i = 0; i < boxes.length; i++) {
      if (used[i]) continue;
      let a = boxes[i];
      for (let j = i + 1; j < boxes.length; j++) {
        if (used[j]) continue;
        const b = boxes[j];
        if (overlapsOrAdjacent(a, b, MERGE_MARGIN)) {
          a = {
            x: Math.min(a.x, b.x),
            y: Math.min(a.y, b.y),
            w: Math.max(a.x + a.w, b.x + b.w) - Math.min(a.x, b.x),
            h: Math.max(a.y + a.h, b.y + b.h) - Math.min(a.y, b.y),
          };
          used[j] = true;
          changed = true;
        }
      }
      merged.push(a);
    }
    boxes = merged;
  }

  return boxes.map(b => ({
    x: Math.max(0, b.x),
    y: Math.max(0, b.y),
    w: Math.min(width  - b.x, b.w),
    h: Math.min(height - b.y, b.h),
  }));
}

function overlapsOrAdjacent(a, b, margin) {
  return !(
    a.x + a.w + margin < b.x ||
    b.x + b.w + margin < a.x ||
    a.y + a.h + margin < b.y ||
    b.y + b.h + margin < a.y
  );
}

/* ─── ANGLE DETECTION (LIGHTWEIGHT PROJECTION) ───────────────────────────── */

function detectAngle(imageData, opts = {}) {
  const { width, height, data } = imageData;
  const { angleRange = 10, angleStep = 0.5 } = opts;

  // Downsample for speed
  const scale = Math.max(1, Math.floor(width / 400));
  const sw = Math.floor(width / scale);
  const sh = Math.floor(height / scale);
  const gray = new Float32Array(sw * sh);

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const sx = x * scale, sy = y * scale;
      const idx = (sy * width + sx) * 4;
      gray[y * sw + x] = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;
    }
  }

  let bestAngle = 0;
  let bestScore = -Infinity;

  for (let deg = -angleRange; deg <= angleRange; deg += angleStep) {
    const rad = deg * Math.PI / 180;
    const score = projectionVariance(gray, sw, sh, rad);
    if (score > bestScore) {
      bestScore = score;
      bestAngle = deg;
    }
  }

  return bestAngle;
}

function projectionVariance(gray, w, h, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const proj = new Float32Array(h);

  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = 0; x < w; x++) {
      const nx = Math.round(x * cos - y * sin);
      const ny = Math.round(x * sin + y * cos);
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        sum += gray[ny * w + nx];
      }
    }
    proj[y] = sum;
  }

  let mean = 0;
  for (const v of proj) mean += v;
  mean /= proj.length;

  let variance = 0;
  for (const v of proj) variance += (v - mean) ** 2;
  return variance;
}
