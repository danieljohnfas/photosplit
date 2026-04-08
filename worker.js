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

function detectPhotos(imageData, opts = {}) {
  const { width, height, data } = imageData;
  const {
    bgThreshold = 240,   // Maps to sensitivity in edge detection
    minAreaRatio = 0.005, // Minimum area ratio 
    dilateRadius = 8,     // Shrink dilation radius to preserve close gaps
    padding = 6,          // extra padding around detected boxes (px)
  } = opts;

  self.postMessage({ type: 'PROGRESS', value: 5, label: 'Finding edges (Sobel)…' });

  // 1. Convert to grayscale and apply Sobel edge detection
  const mask = new Uint8Array(width * height);
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  // Calculate edge sensitivity based on bgThreshold slider
  // Slider 240 -> edgeThresh = 40 (high sensitivity). Lower slider -> stronger edge required.
  const edgeThresh = Math.max(20, (260 - bgThreshold) * 2);

  for (let y = 1; y < height - 1; y++) {
    let offset = y * width + 1;
    for (let x = 1; x < width - 1; x++, offset++) {
      const p00 = gray[offset - width - 1];   const p01 = gray[offset - width];       const p02 = gray[offset - width + 1];
      const p10 = gray[offset - 1];                                                   const p12 = gray[offset + 1];
      const p20 = gray[offset + width - 1];   const p21 = gray[offset + width];       const p22 = gray[offset + width + 1];
      
      const gx = p02 - p00 + 2 * (p12 - p10) + p22 - p20;
      const gy = p20 - p00 + 2 * (p21 - p01) + p22 - p02;
      
      let mag = gx; if (mag < 0) mag = -mag;
      let magY = gy; if (magY < 0) magY = -magY;
      
      if (mag + magY > edgeThresh) {
        mask[offset] = 1;
      }
    }
  }

  self.postMessage({ type: 'PROGRESS', value: 20, label: 'Dilating mask…' });

  // 2. Morphological dilation to fill holes inside photos
  const dilated = dilate(mask, width, height, dilateRadius);

  self.postMessage({ type: 'PROGRESS', value: 40, label: 'Finding connected components…' });

  // 3. Connected-component labeling (union-find)
  const labels = labelComponents(dilated, width, height);

  self.postMessage({ type: 'PROGRESS', value: 65, label: 'Computing bounding boxes…' });

  // 4. Compute bounding box per label
  const bboxMap = {};
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const lbl = labels[y * width + x];
      if (lbl === 0) continue;
      if (!bboxMap[lbl]) {
        bboxMap[lbl] = { minX: x, minY: y, maxX: x, maxY: y, count: 0 };
      }
      const b = bboxMap[lbl];
      if (x < b.minX) b.minX = x;
      if (y < b.minY) b.minY = y;
      if (x > b.maxX) b.maxX = x;
      if (y > b.maxY) b.maxY = y;
      b.count++;
    }
  }

  self.postMessage({ type: 'PROGRESS', value: 80, label: 'Filtering regions…' });

  const totalPixels = width * height;
  const minArea = totalPixels * minAreaRatio;
  const maxArea = totalPixels * 0.90; // Ignore bounding boxes that cover >90% of the scan (e.g. glass border)

  const boxes = [];
  for (const lbl in bboxMap) {
    const b = bboxMap[lbl];
    const bw = b.maxX - b.minX;
    const bh = b.maxY - b.minY;
    const area = bw * bh;
    if (area < minArea || area > maxArea) continue;
    // Filter out very thin strips (likely scan borders)
    const aspect = bw / (bh || 1);
    if (aspect > 10 || aspect < 0.1) continue;

    boxes.push({
      x: Math.max(0, b.minX - padding),
      y: Math.max(0, b.minY - padding),
      w: Math.min(width, b.maxX + padding) - Math.max(0, b.minX - padding),
      h: Math.min(height, b.maxY + padding) - Math.max(0, b.minY - padding),
    });
  }

  self.postMessage({ type: 'PROGRESS', value: 90, label: 'Merging overlapping boxes…' });

  const merged = mergeOverlapping(boxes, width, height);

  self.postMessage({ type: 'PROGRESS', value: 100, label: 'Detection complete' });

  return merged;
}

/* ─── MORPHOLOGICAL DILATION ─────────────────────────────────────────────── */

function dilate(mask, width, height, radius) {
  // Row dilation then column dilation (separable approximation)
  const tmp = new Uint8Array(width * height);
  const out = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let found = false;
      const xStart = Math.max(0, x - radius);
      const xEnd = Math.min(width - 1, x + radius);
      for (let nx = xStart; nx <= xEnd; nx++) {
        if (mask[y * width + nx]) { found = true; break; }
      }
      tmp[y * width + x] = found ? 1 : 0;
    }
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let found = false;
      const yStart = Math.max(0, y - radius);
      const yEnd = Math.min(height - 1, y + radius);
      for (let ny = yStart; ny <= yEnd; ny++) {
        if (tmp[ny * width + x]) { found = true; break; }
      }
      out[y * width + x] = found ? 1 : 0;
    }
  }

  return out;
}

/* ─── UNION-FIND (CONNECTED COMPONENTS) ─────────────────────────────────── */

function labelComponents(mask, width, height) {
  const parent = new Int32Array(width * height);
  const labels = new Int32Array(width * height);

  // Initialize
  for (let i = 0; i < parent.length; i++) parent[i] = i;

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(a, b) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }

  // First pass — connect 4-neighbors
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!mask[idx]) continue;
      if (x > 0 && mask[idx - 1]) union(idx, idx - 1);
      if (y > 0 && mask[idx - width]) union(idx, idx - width);
    }
  }

  // Second pass — assign canonical labels
  let nextLabel = 1;
  const rootToLabel = {};
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
        if (overlapsOrAdjacent(a, b, 5)) {
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
    w: Math.min(width - b.x, b.w),
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

/* ─── ANGLE DETECTION (LIGHTWEIGHT HOUGH) ───────────────────────────────── */

function detectAngle(imageData, opts = {}) {
  const { width, height, data } = imageData;
  const { angleRange = 10, angleStep = 0.5 } = opts;

  // Sobel edge detection on a downsampled version for speed
  const scale = Math.max(1, Math.floor(width / 400));
  const sw = Math.floor(width / scale);
  const sh = Math.floor(height / scale);
  const gray = new Float32Array(sw * sh);

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const sx = x * scale;
      const sy = y * scale;
      const idx = (sy * width + sx) * 4;
      gray[y * sw + x] = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;
    }
  }

  // Simple projection-based angle: find angle that maximizes horizontal projection variance
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
