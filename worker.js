/**
 * PhotoSplit Studio — Web Worker (OpenCV.js Engine)
 * Handles robust computer vision for photo detection.
 */

'use strict';

// We load opencv.js dynamically to avoid blocking the main thread UX.
let cvReady = false;
let cvInitCallbacks = [];

// When the worker starts, fetch OpenCV
self.postMessage({ type: 'PROGRESS', value: 0, label: 'Downloading vision engine (once)…' });

// We define Module before importing so opencv.js knows how to signal readiness
self.Module = {
  onRuntimeInitialized: function() {
    cvReady = true;
    self.postMessage({ type: 'PROGRESS', value: 0, label: 'Vision engine ready.' });
    // Process any queued image tasks
    while (cvInitCallbacks.length > 0) {
      const cb = cvInitCallbacks.shift();
      cb();
    }
  }
};

// Import OpenCV WASM asynchronously
importScripts('https://docs.opencv.org/4.8.0/opencv.js');

self.onmessage = function (e) {
  const { type, imageData, options } = e.data;

  if (!cvReady) {
    // Queue the request until OpenCV is fully initialized
    cvInitCallbacks.push(() => handleRequest(type, imageData, options));
  } else {
    handleRequest(type, imageData, options);
  }
};

function handleRequest(type, imageData, options) {
  try {
    switch (type) {
      case 'DETECT_PHOTOS':
        const boxes = detectPhotosOpenCV(imageData, options);
        self.postMessage({ type: 'DETECT_DONE', boxes });
        break;

      case 'STRAIGHTEN_ANALYZE':
        const angle = detectAngleOpenCV(imageData, options);
        self.postMessage({ type: 'STRAIGHTEN_DONE', angle });
        break;

      default:
        self.postMessage({ type: 'ERROR', message: 'Unknown worker task: ' + type });
    }
  } catch (err) {
    // If OpenCV throws, it often throws a numerical error code. We capture the stack or message.
    console.error("OpenCV Error:", err);
    self.postMessage({ type: 'ERROR', message: err.message || 'OpenCV processing failed.' });
  }
}

/* ─── OPENCV DETECTION PIPELINE ─────────────────────────────────────────── */

function detectPhotosOpenCV(imageData, opts = {}) {
  const { width, height, data } = imageData;
  const {
    bgThreshold = 240,    // Sensitivity map slider (1 - 255)
    minAreaRatio = 0.005, // Minimum area ratio slider
    padding = 10,
  } = opts;

  self.postMessage({ type: 'PROGRESS', value: 10, label: 'Reading image data…' });

  // 1. Create a cv.Mat from the raw ImageData
  const src = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  
  // 2. Convert to Grayscale
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  self.postMessage({ type: 'PROGRESS', value: 30, label: 'Applying edge filters…' });

  // 3. Gaussian Blur to reduce scanner noise before edge detection
  const blurred = new cv.Mat();
  // Using a 5x5 kernel
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

  // 4. Adaptive Canny Edge Detection
  // The bgThreshold slider maps to how tightly we look for edges.
  // Higher slider -> lower threshold -> finds more edges (more sensitive).
  const upperThresh = Math.max(20, (260 - bgThreshold) * 1.5); // increased sensitivity
  const lowerThresh = Math.max(10, upperThresh * 0.3); // enhanced detection of faint white edges
  
  const edges = new cv.Mat();
  cv.Canny(blurred, edges, lowerThresh, upperThresh, 3, false);

  self.postMessage({ type: 'PROGRESS', value: 50, label: 'Closing photo boundaries…' });

  // 5. Morphological Closing (Dilate then Erode) to bridge gaps in faded photo borders
  // Scale the kernel size based on image resolution
  const kSizeVal = Math.max(7, Math.floor(Math.min(width, height) * 0.005) * 2 + 1);
  const M = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(kSizeVal, kSizeVal));
  
  const closed = new cv.Mat();
  // We use dilate to bridge tiny gaps, but keep iterations low (1) to prevent merging uniquely placed photos
  cv.dilate(edges, closed, M, new cv.Point(-1, -1), 1);
  cv.erode(closed, closed, M, new cv.Point(-1, -1), 1);

  self.postMessage({ type: 'PROGRESS', value: 70, label: 'Extracting contours…' });

  // 6. Find Contours
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  // RETR_EXTERNAL gets only the outer bounding shapes (perfect for distinct photos)
  cv.findContours(closed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  self.postMessage({ type: 'PROGRESS', value: 90, label: 'Calculating bounding boxes…' });

  // 7. Process contours into bounding rects
  const minArea = width * height * minAreaRatio;
  const maxArea = width * height * 0.95; // Exclude the entire scanner glass itself
  
  let resultBoxes = [];

  for (let i = 0; i < contours.size(); ++i) {
    const cnt = contours.get(i);
    const rect = cv.boundingRect(cnt);
    const area = rect.width * rect.height;

    if (area >= minArea && area <= maxArea) {
      // Basic aspect ratio filter to ignore extreme strips (like scanner alignment bars)
      const aspect = rect.width / (rect.height || 1);
      if (aspect > 0.08 && aspect < 12) {
        
        // Also capture the rotated rect for auto-straighten metadata
        const rotatedRect = cv.minAreaRect(cnt);
        let angle = rotatedRect.angle;
        // OpenCV's angle logic is a bit weird depending on the version/aspect.
        // We normalize it to a sensible +/- 45 degree tilt.
        if (rotatedRect.size.width < rotatedRect.size.height) {
          angle = angle + 90;
        }

        resultBoxes.push({
          x: Math.max(0, rect.x - padding),
          y: Math.max(0, rect.y - padding),
          w: Math.min(width,  rect.width + padding * 2),
          h: Math.min(height, rect.height + padding * 2),
          suggestedAngle: -angle // Invert for CSS/Canvas rotation
        });
      }
    }
  }

  // Merge overlapping boxes in JS (sometimes two adjacent contours belong to the same photo)
  resultBoxes = mergeOverlapping(resultBoxes, width, height);

  self.postMessage({ type: 'PROGRESS', value: 100, label: 'Detection complete.' });

  // 8. FREE MEMORY! Absolutely critical in OpenCV.js
  src.delete();
  gray.delete();
  blurred.delete();
  edges.delete();
  M.delete();
  closed.delete();
  contours.delete();
  hierarchy.delete();

  return resultBoxes;
}

/* ─── MERGE OVERLAPPING ─────────────────────────────────────────────────── */
function mergeOverlapping(boxes, width, height) {
  if (boxes.length === 0) return [];
  const MERGE_MARGIN = 2; // Reduced from 20 to prevent false-merges of close photos

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
          // Keep the suggested angle of the larger box
          const aArea = a.w * a.h;
          const bArea = b.w * b.h;
          const dominantAngle = aArea > bArea ? a.suggestedAngle : b.suggestedAngle;

          a = {
            x: Math.min(a.x, b.x),
            y: Math.min(a.y, b.y),
            w: Math.max(a.x + a.w, b.x + b.w) - Math.min(a.x, b.x),
            h: Math.max(a.y + a.h, b.y + b.h) - Math.min(a.y, b.y),
            suggestedAngle: dominantAngle
          };
          used[j] = true;
          changed = true;
        }
      }
      merged.push(a);
    }
    boxes = merged;
  }
  
  // Final bounds clamp
  return boxes.map(b => {
    const clampedX = Math.max(0, b.x);
    const clampedY = Math.max(0, b.y);
    return {
      x: clampedX,
      y: clampedY,
      w: Math.min(width - clampedX, b.w),
      h: Math.min(height - clampedY, b.h),
      suggestedAngle: b.suggestedAngle
    };
  });
}

function overlapsOrAdjacent(a, b, margin) {
  return !(
    a.x + a.w + margin < b.x ||
    b.x + b.w + margin < a.x ||
    a.y + a.h + margin < b.y ||
    b.y + b.h + margin < a.y
  );
}

/* ─── FAST ANGLE DETECTION FOR MANUAL BOXES ─────────────────────────────── */
function detectAngleOpenCV(imageData, opts = {}) {
  const src = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  const edges = new cv.Mat();
  cv.Canny(gray, edges, 50, 150, 3, false);

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let bestAngle = 0;
  let maxArea = 0;

  for (let i = 0; i < contours.size(); ++i) {
    const cnt = contours.get(i);
    const area = cv.contourArea(cnt);
    if (area > maxArea) {
      maxArea = area;
      const rotatedRect = cv.minAreaRect(cnt);
      let angle = rotatedRect.angle;
      if (rotatedRect.size.width < rotatedRect.size.height) {
         angle += 90;
      }
      bestAngle = -angle;
    }
  }

  // Free memory
  src.delete(); gray.delete(); edges.delete(); contours.delete(); hierarchy.delete();

  // Clamp wild angles
  if (Math.abs(bestAngle) > 40) return 0;
  return bestAngle;
}
