/**
 * PhotoSplit Studio — app.js
 * All client-side logic. Zero network requests involving user images.
 * ─────────────────────────────────────────────────────────────────
 * Modules:
 *  FileManager        — upload, decode, manage scan list
 *  ScanProcessor      — invoke worker, handle detection results
 *  BoundingBoxEditor  — SVG overlay, drag/resize/keyboard, undo/redo
 *  ImageTransforms    — rotate, straighten, enhance
 *  ExportManager      — canvas render per box, JPEG/PNG download
 *  UIController       — dark mode, zoom, modals, toasts, progress
 */

'use strict';

/* ══════════════════════════════════════════════════════════════════════════ *
 *  CONSTANTS & CONFIG                                                        *
 * ══════════════════════════════════════════════════════════════════════════ */
const CONFIG = {
  MAX_CANVAS_DIM: 8000,      // Safety cap on canvas dimension (px)
  MIN_BOX_PX: 40,            // Minimum bounding box side (px in canvas coords)
  HANDLE_RADIUS: 5,          // SVG circle handle radius (px)
  UNDO_LIMIT: 50,            // Max undo history depth
  THUMBNAIL_H: 80,           // Strip thumbnail height (px)
  DEFAULT_JPEG_QUALITY: 0.90,
  ZOOM_STEP: 0.15,
  ZOOM_MIN: 0.1,
  ZOOM_MAX: 6,
  WORKER_TIMEOUT_MS: 120_000,
};

const HANDLE_DIRS = ['nw','n','ne','e','se','s','sw','w'];

/* ══════════════════════════════════════════════════════════════════════════ *
 *  STATE                                                                     *
 * ══════════════════════════════════════════════════════════════════════════ */
const state = {
  // Files
  files: [],          // Array of { file, img, name }
  activeFileIdx: -1,

  // Canvas
  zoom: 1,
  panX: 0,
  panY: 0,

  // Splits / bounding boxes  (in *canvas image* pixel coords)
  boxes: [],          // { id, x, y, w, h, rotation, label }
  selectedBoxId: null,
  nextBoxId: 1,

  // Undo / redo
  undoStack: [],
  redoStack: [],

  // Interaction
  dragging: null,     // { type:'move'|'handle', ... }
  cropDrawing: false,
  cropStart: null,

  // Worker
  worker: null,
  workerBusy: false,

  // Dark mode
  darkMode: false,

  // Output settings (read from form on export)
  outputFormat: 'jpeg',
  jpegQuality: 0.90,
  baseFilename: 'photo_',
  autoStraighten: false,
  autoEnhance: false,
};

/* ══════════════════════════════════════════════════════════════════════════ *
 *  DOM REFS                                                                  *
 * ══════════════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const DOM = {
  uploadZone:       () => $('upload-zone'),
  fileInput:        () => $('file-input'),
  fileList:         () => $('file-list'),
  emptyState:       () => $('empty-state'),
  canvasArea:       () => $('canvas-area'),
  canvasScroll:     () => $('canvas-scroll'),
  canvasWrapper:    () => $('canvas-wrapper'),
  mainCanvas:       () => $('main-canvas'),
  overlaySvg:       () => $('overlay-svg'),
  drawOverlay:      () => $('draw-overlay'),
  drawPreviewRect:  () => $('draw-preview-rect'),
  splitsPanel:      () => $('splits-panel'),
  splitsStrip:      () => $('splits-strip'),
  splitsCount:      () => $('splits-count'),
  progressContainer:() => $('progress-container'),
  progressFill:     () => $('progress-bar-fill'),
  progressLabel:    () => $('progress-label'),
  modalBackdrop:    () => $('modal-backdrop'),
  modalBox:         () => $('modal-box'),
  modalTitle:       () => $('modal-title'),
  modalPreviewImg:  () => $('modal-preview-img'),
  modalActions:     () => $('modal-actions'),
  toastContainer:   () => $('toast-container'),
  darkToggle:       () => $('dark-toggle'),
  zoomControls:     () => $('zoom-controls'),
  zoomLabel:        () => $('zoom-label'),
  globalSpinner:    () => $('global-spinner'),
  globalSpinnerMsg: () => $('global-spinner-msg'),
  formatSelect:     () => $('format-select'),
  qualitySlider:    () => $('quality-slider'),
  qualityVal:       () => $('quality-val'),
  filenameInput:    () => $('filename-input'),
  bgThresholdSlider:() => $('bg-threshold-slider'),
  bgThresholdVal:   () => $('bg-threshold-val'),
  minAreaSlider:    () => $('min-area-slider'),
  minAreaVal:       () => $('min-area-val'),
  autoStraightenToggle:() => $('auto-straighten-toggle'),
  autoEnhanceToggle:() => $('auto-enhance-toggle'),
  btnDetect:        () => $('btn-detect'),
  btnAddCrop:       () => $('btn-add-crop'),
  btnSaveAll:       () => $('btn-save-all'),
  btnUndo:          () => $('btn-undo'),
  btnRedo:          () => $('btn-redo'),
  btnZoomIn:        () => $('btn-zoom-in'),
  btnZoomOut:       () => $('btn-zoom-out'),
  btnZoomFit:       () => $('btn-zoom-fit'),
};

/* ══════════════════════════════════════════════════════════════════════════ *
 *  UTILITIES                                                                 *
 * ══════════════════════════════════════════════════════════════════════════ */

function genId() { return state.nextBoxId++; }

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function normalizeBox(x, y, w, h) {
  return {
    x: w < 0 ? x + w : x,
    y: h < 0 ? y + h : y,
    w: Math.abs(w),
    h: Math.abs(h),
  };
}

function deepCloneBoxes() {
  return state.boxes.map(b => ({ ...b }));
}

function pushUndo() {
  state.undoStack.push(deepCloneBoxes());
  if (state.undoStack.length > CONFIG.UNDO_LIMIT) state.undoStack.shift();
  state.redoStack = [];
  refreshUndoButtons();
}

function undo() {
  if (!state.undoStack.length) return;
  state.redoStack.push(deepCloneBoxes());
  state.boxes = state.undoStack.pop();
  state.selectedBoxId = null;
  refreshUndoButtons();
  renderOverlay();
  renderStrip();
}

function redo() {
  if (!state.redoStack.length) return;
  state.undoStack.push(deepCloneBoxes());
  state.boxes = state.redoStack.pop();
  state.selectedBoxId = null;
  refreshUndoButtons();
  renderOverlay();
  renderStrip();
}

function refreshUndoButtons() {
  DOM.btnUndo().disabled = state.undoStack.length === 0;
  DOM.btnRedo().disabled = state.redoStack.length === 0;
}

/* Show / hide the UI panel states */
function showCanvas() {
  DOM.emptyState().classList.add('hidden');
  DOM.canvasWrapper().style.display = 'inline-block';
  DOM.zoomControls().classList.add('visible');
}

function hideCanvas() {
  DOM.emptyState().classList.remove('hidden');
  DOM.canvasWrapper().style.display = 'none';
  DOM.zoomControls().classList.remove('visible');
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  UI CONTROLLER — Toast, Progress, Spinner, Dark Mode                      *
 * ══════════════════════════════════════════════════════════════════════════ */

function showToast(msg, type = 'info', duration = 3200) {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${ICONS[type] || '💬'}</span><span>${msg}</span>`;
  DOM.toastContainer().appendChild(t);
  setTimeout(() => {
    t.classList.add('removing');
    t.addEventListener('animationend', () => t.remove());
  }, duration);
}

const ICONS = {
  success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️',
};

function setProgress(pct, label = '') {
  DOM.progressContainer().classList.add('active');
  DOM.progressFill().style.width = pct + '%';
  DOM.progressLabel().textContent = label;
  if (pct >= 100) {
    setTimeout(() => DOM.progressContainer().classList.remove('active'), 900);
  }
}

function showSpinner(msg = 'Processing…') {
  DOM.globalSpinnerMsg().textContent = msg;
  DOM.globalSpinner().classList.add('active');
}

function hideSpinner() {
  DOM.globalSpinner().classList.remove('active');
}

function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  document.documentElement.dataset.theme = state.darkMode ? 'dark' : '';
  DOM.darkToggle().title = state.darkMode ? 'Switch to light mode' : 'Switch to dark mode';
  DOM.darkToggle().innerHTML = state.darkMode
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  FILE MANAGER                                                              *
 * ══════════════════════════════════════════════════════════════════════════ */

function initFileManager() {
  const zone = DOM.uploadZone();
  const input = DOM.fileInput();

  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', e => {
    handleFiles([...e.target.files]);
    e.target.value = ''; // Clear value to allow picking the same file again
  });

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFiles([...e.dataTransfer.files]);
  });
}

const ALLOWED_TYPES = ['image/jpeg','image/png','image/tiff','image/bmp','image/gif','image/webp'];

async function handleFiles(files) {
  const valid = files.filter(f => ALLOWED_TYPES.includes(f.type) ||
    /\.(jpe?g|png|tiff?|bmp|gif|webp)$/i.test(f.name));

  if (!valid.length) {
    showToast('No supported image files found.', 'warning');
    return;
  }

  for (const file of valid) {
    // Check for duplicates by name
    if (state.files.find(f => f.file.name === file.name)) {
      showToast('File already loaded: ' + file.name, 'warning');
      continue;
    }
    showSpinner(`Loading ${file.name}…`);
    try {
      const img = await loadImageFile(file);
      state.files.push({ file, img, name: file.name });
      addFileChip(state.files.length - 1);
    } catch (err) {
      showToast(`Could not load ${file.name}: ${err.message}`, 'error');
    }
    hideSpinner();
  }

  if (state.activeFileIdx < 0 && state.files.length > 0) {
    activateFile(0);
  }
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    // Browsers natively fail on TIFFs, use our UTIF library via ArrayBuffer
    if (file.type === 'image/tiff' || /\.(tiff?)$/i.test(file.name)) {
      if (typeof UTIF === 'undefined') {
        return reject(new Error('TIFF support library is not available / blocked.'));
      }
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const buffer = e.target.result;
          const ifds = UTIF.decode(buffer);
          if (!ifds || !ifds.length) throw new Error('No image found in TIFF.');
          const ifd = ifds[0];
          UTIF.decodeImage(buffer, ifd);
          const rgba = UTIF.toRGBA8(ifd);
          const canvas = document.createElement('canvas');
          canvas.width = ifd.width;
          canvas.height = ifd.height;
          const ctx = canvas.getContext('2d');
          const imgData = new ImageData(new Uint8ClampedArray(rgba.buffer), ifd.width, ifd.height);
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas); // Canvas is completely compatible with our drawScanToCanvas
        } catch (err) {
          reject(new Error('Corrupt or unsupported TIFF: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('File read error.'));
      reader.readAsArrayBuffer(file);
      return;
    }

    // Normal browser-supported images (JPEG, PNG, etc)
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image failed to load (unsupported format)')); };
    img.src = url;
  });
}

function addFileChip(idx) {
  const entry = state.files[idx];
  const chip = document.createElement('div');
  chip.className = 'file-chip';
  chip.id = `file-chip-${idx}`;
  chip.innerHTML = `
    <span class="file-chip-icon">🖼️</span>
    <span class="file-chip-name" title="${entry.name}">${entry.name}</span>
    <button class="file-chip-remove" title="Remove" aria-label="Remove file">✕</button>
  `;
  chip.querySelector('.file-chip-remove').addEventListener('click', e => {
    e.stopPropagation();
    removeFile(idx);
  });
  chip.addEventListener('click', () => activateFile(idx));
  DOM.fileList().appendChild(chip);
}

function removeFile(idx) {
  state.files.splice(idx, 1);
  const chip = $(`file-chip-${idx}`);
  if (chip) chip.remove();
  // Rebuild chips
  DOM.fileList().innerHTML = '';
  state.files.forEach((_, i) => addFileChip(i));

  if (state.activeFileIdx >= state.files.length) {
    state.activeFileIdx = state.files.length - 1;
  }
  if (state.files.length === 0) {
    state.activeFileIdx = -1;
    state.boxes = [];
    hideCanvas();
    DOM.splitsPanel().classList.remove('visible');
  } else {
    activateFile(state.activeFileIdx);
  }
}

function activateFile(idx) {
  state.activeFileIdx = idx;
  state.boxes = [];
  state.selectedBoxId = null;
  state.undoStack = [];
  state.redoStack = [];
  refreshUndoButtons();

  // Highlight chip
  document.querySelectorAll('.file-chip').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });

  const entry = state.files[idx];
  drawScanToCanvas(entry.img);
  showCanvas();
  zoomFit();
  renderOverlay();
  renderStrip();
  DOM.splitsPanel().classList.remove('visible');
  showToast(`Loaded: ${entry.name}`, 'info', 2000);
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  CANVAS RENDERING                                                          *
 * ══════════════════════════════════════════════════════════════════════════ */

function drawScanToCanvas(img) {
  const canvas = DOM.mainCanvas();

  let w = img.naturalWidth  || img.width;
  let h = img.naturalHeight || img.height;

  // Safety cap
  if (w > CONFIG.MAX_CANVAS_DIM || h > CONFIG.MAX_CANVAS_DIM) {
    const ratio = Math.min(CONFIG.MAX_CANVAS_DIM / w, CONFIG.MAX_CANVAS_DIM / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);

  // Apply canvas display size via zoom
  applyZoom();
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  ZOOM                                                                      *
 * ══════════════════════════════════════════════════════════════════════════ */

function applyZoom() {
  const canvas = DOM.mainCanvas();
  const w = canvas.width  * state.zoom;
  const h = canvas.height * state.zoom;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  DOM.canvasWrapper().style.width  = w + 'px';
  DOM.canvasWrapper().style.height = h + 'px';
  DOM.zoomLabel().textContent = Math.round(state.zoom * 100) + '%';
  renderOverlay();
}

function zoomFit() {
  const canvas = DOM.mainCanvas();
  if (!canvas.width) return;
  const scroll = DOM.canvasScroll();
  const { clientWidth, clientHeight } = scroll;
  const padW = 48, padH = 48;
  const zx = (clientWidth  - padW) / canvas.width;
  const zy = (clientHeight - padH) / canvas.height;
  state.zoom = clamp(Math.min(zx, zy), CONFIG.ZOOM_MIN, CONFIG.ZOOM_MAX);
  applyZoom();
}

function zoomIn()  { state.zoom = clamp(state.zoom + CONFIG.ZOOM_STEP, CONFIG.ZOOM_MIN, CONFIG.ZOOM_MAX); applyZoom(); }
function zoomOut() { state.zoom = clamp(state.zoom - CONFIG.ZOOM_STEP, CONFIG.ZOOM_MIN, CONFIG.ZOOM_MAX); applyZoom(); }

// Mouse-wheel zoom on canvas
function initZoomWheel() {
  DOM.canvasScroll().addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn(); else zoomOut();
    }
  }, { passive: false });
}

/* Convert client coordinates to canvas (image) coordinates */
function clientToCanvas(cx, cy) {
  const rect = DOM.mainCanvas().getBoundingClientRect();
  const canvas = DOM.mainCanvas();
  return {
    x: (cx - rect.left) * (canvas.width  / rect.width),
    y: (cy - rect.top)  * (canvas.height / rect.height),
  };
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  WEB WORKER INTEGRATION                                                    *
 * ══════════════════════════════════════════════════════════════════════════ */

function spawnWorker() {
  if (state.worker) return;
  try {
    state.worker = new Worker('worker.js?v=' + Date.now());
    state.worker.onmessage = handleWorkerMessage;
    state.worker.onerror = e => {
      console.error('Worker error:', e);
      showToast('Worker error: ' + e.message, 'error');
      state.workerBusy = false;
      hideSpinner();
    };
  } catch (err) {
    console.warn('Web Worker spawn failed — will fallback to main thread:', err.message);
    state.worker = null;
  }
}

function handleWorkerMessage(e) {
  const { type, boxes, angle, value, label, message } = e.data;
  switch (type) {
    case 'PROGRESS':
      setProgress(value, label);
      break;
    case 'DETECT_DONE':
      state.workerBusy = false;
      hideSpinner();
      applyDetectedBoxes(boxes);
      break;
    case 'STRAIGHTEN_DONE':
      state.workerBusy = false;
      applyAutoStraighten(angle);
      break;
    case 'ERROR':
      state.workerBusy = false;
      hideSpinner();
      showToast('Processing error: ' + message, 'error');
      break;
  }
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  SCAN PROCESSOR — Auto-detection                                           *
 * ══════════════════════════════════════════════════════════════════════════ */

async function runDetection() {
  if (state.activeFileIdx < 0) { showToast('Upload a scan first.', 'warning'); return; }
  if (state.workerBusy) { showToast('Already processing…', 'warning'); return; }

  const canvas = DOM.mainCanvas();
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const opts = {
    bgThreshold: parseInt(DOM.bgThresholdSlider().value, 10),
    minAreaRatio: parseFloat(DOM.minAreaSlider().value) / 100,
  };

  const btn = DOM.btnDetect();
  btn.disabled = true;
  btn.classList.add('processing-pulse');

  if (state.worker) {
    state.workerBusy = true;
    showSpinner('Detecting photos…');
    setProgress(0, 'Starting…');
    state.worker.postMessage({ type: 'DETECT_PHOTOS', imageData, options: opts },
      [imageData.data.buffer]);
  } else {
    // Fallback: run on main thread (will block UI briefly)
    showSpinner('Detecting photos (main thread)…');
    await new Promise(r => setTimeout(r, 50));
    try {
      const boxes = detectPhotosFallback(imageData, opts);
      applyDetectedBoxes(boxes);
    } catch (err) {
      showToast('Detection failed: ' + err.message, 'error');
    }
    hideSpinner();
  }

  btn.disabled = false;
  btn.classList.remove('processing-pulse');
}

function applyDetectedBoxes(boxes) {
  if (!boxes || boxes.length === 0) {
    showToast('No photos detected. Try adjusting sensitivity or draw manually.', 'warning');
    return;
  }

  pushUndo();
  state.boxes = boxes.map(b => ({
    id: genId(),
    x: b.x, y: b.y, w: b.w, h: b.h,
    rotation: 0,
    label: '',
  }));
  state.selectedBoxId = null;

  if (state.autoStraightenToggle && DOM.autoStraightenToggle().checked) {
    runStraightenAll();
  }

  renderOverlay();
  renderStrip();
  DOM.splitsPanel().classList.add('visible');
  showToast(`Detected ${state.boxes.length} photo${state.boxes.length !== 1 ? 's' : ''}.`, 'success');
}

/* ── Fallback detection (main thread — mirrors worker logic) ──────────────── */
function detectPhotosFallback(imageData, opts = {}) {
  const { width, height, data } = imageData;
  const {
    bgThreshold  = 240,
    minAreaRatio = 0.005,
    padding      = 10,
  } = opts;

  const neutralTolerance = 35;
  const dilateRadius = Math.max(12, Math.min(80, Math.round(Math.min(width, height) * 0.015)));

  // Step 1: Background segmentation + Sobel supplement
  const gray = new Uint8Array(width * height);
  const mask = new Uint8Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) | 0;
    const lo = r < g ? (r < b ? r : b) : (g < b ? g : b);
    const hi = r > g ? (r > b ? r : b) : (g > b ? g : b);
    mask[i] = (gray[i] >= bgThreshold && (hi - lo) < neutralTolerance) ? 0 : 1;
  }

  const edgeSuppThresh = 28;
  for (let y = 1; y < height - 1; y++) {
    let off = y * width + 1;
    for (let x = 1; x < width - 1; x++, off++) {
      if (mask[off]) continue;
      const p00=gray[off-width-1],p01=gray[off-width],p02=gray[off-width+1];
      const p10=gray[off-1],p12=gray[off+1];
      const p20=gray[off+width-1],p21=gray[off+width],p22=gray[off+width+1];
      const gx=p02-p00+2*(p12-p10)+p22-p20;
      const gy=p20-p00+2*(p21-p01)+p22-p02;
      if ((gx<0?-gx:gx)+(gy<0?-gy:gy) > edgeSuppThresh) mask[off]=1;
    }
  }

  // Step 2: Morphological close
  const dilated  = dilateMT(mask, width, height, dilateRadius);
  const erodeRad = Math.max(4, Math.round(dilateRadius * 0.35));
  const closed   = erodeMT(dilated, width, height, erodeRad);

  // Step 3: Connected components
  const labels = labelComponentsMT(closed, width, height);

  // Step 4: Bounding boxes
  const bboxMap = Object.create(null);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const lbl = labels[y * width + x];
      if (!lbl) continue;
      let b = bboxMap[lbl];
      if (!b) { bboxMap[lbl] = b = { minX:x, minY:y, maxX:x, maxY:y }; }
      if (x < b.minX) b.minX=x; if (y < b.minY) b.minY=y;
      if (x > b.maxX) b.maxX=x; if (y > b.maxY) b.maxY=y;
    }
  }

  // Step 5: Filter
  const minArea = width * height * minAreaRatio;
  const maxArea = width * height * 0.92;
  const boxes = [];
  for (const lbl in bboxMap) {
    const b = bboxMap[lbl];
    const bw = b.maxX - b.minX, bh = b.maxY - b.minY;
    const area = bw * bh;
    if (area < minArea || area > maxArea) continue;
    const aspect = bw / (bh || 1);
    if (aspect > 12 || aspect < 0.083) continue;
    boxes.push({
      x: Math.max(0, b.minX - padding),
      y: Math.max(0, b.minY - padding),
      w: Math.min(width,  b.maxX + padding) - Math.max(0, b.minX - padding),
      h: Math.min(height, b.maxY + padding) - Math.max(0, b.minY - padding),
    });
  }
  return mergeOverlappingMT(boxes, width, height);
}

function dilateMT(mask, width, height, r) {
  const tmp = new Uint8Array(width * height);
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const ro = y * width;
    for (let x = 0; x < width; x++) {
      const x0=Math.max(0,x-r), x1=Math.min(width-1,x+r);
      let f=false; for (let nx=x0;nx<=x1;nx++) if(mask[ro+nx]){f=true;break;}
      tmp[ro+x]=f?1:0;
    }
  }
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const y0=Math.max(0,y-r), y1=Math.min(height-1,y+r);
      let f=false; for (let ny=y0;ny<=y1;ny++) if(tmp[ny*width+x]){f=true;break;}
      out[y*width+x]=f?1:0;
    }
  }
  return out;
}

function erodeMT(mask, width, height, r) {
  const tmp = new Uint8Array(width * height);
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const ro = y * width;
    for (let x = 0; x < width; x++) {
      if (!mask[ro+x]) { tmp[ro+x]=0; continue; }
      const x0=Math.max(0,x-r), x1=Math.min(width-1,x+r);
      let all=true; for (let nx=x0;nx<=x1;nx++) if(!mask[ro+nx]){all=false;break;}
      tmp[ro+x]=all?1:0;
    }
  }
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (!tmp[y*width+x]) { out[y*width+x]=0; continue; }
      const y0=Math.max(0,y-r), y1=Math.min(height-1,y+r);
      let all=true; for (let ny=y0;ny<=y1;ny++) if(!tmp[ny*width+x]){all=false;break;}
      out[y*width+x]=all?1:0;
    }
  }
  return out;
}



function labelComponentsMT(mask, width, height) {
  const parent = new Int32Array(width*height);
  const labels = new Int32Array(width*height);
  for (let i=0;i<parent.length;i++) parent[i]=i;
  function find(x){while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
  function union(a,b){const ra=find(a),rb=find(b);if(ra!==rb)parent[ra]=rb;}
  for (let y=0;y<height;y++) for (let x=0;x<width;x++) {
    const idx=y*width+x;
    if (!mask[idx]) continue;
    if (x>0&&mask[idx-1]) union(idx,idx-1);
    if (y>0&&mask[idx-width]) union(idx,idx-width);
  }
  let next=1; const m={};
  for (let i=0;i<mask.length;i++) {
    if (!mask[i]){labels[i]=0;continue;}
    const r=find(i);
    if (m[r]===undefined) m[r]=next++;
    labels[i]=m[r];
  }
  return labels;
}

function mergeOverlappingMT(boxes, width, height) {
  if (!boxes.length) return [];
  let changed=true;
  while(changed){
    changed=false;
    const used=new Array(boxes.length).fill(false), merged=[];
    for(let i=0;i<boxes.length;i++){
      if(used[i]) continue;
      let a=boxes[i];
      for(let j=i+1;j<boxes.length;j++){
        if(used[j]) continue;
        const b=boxes[j];
        if(!(a.x+a.w+5<b.x||b.x+b.w+5<a.x||a.y+a.h+5<b.y||b.y+b.h+5<a.y)){
          a={x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),
             w:Math.max(a.x+a.w,b.x+b.w)-Math.min(a.x,b.x),
             h:Math.max(a.y+a.h,b.y+b.h)-Math.min(a.y,b.y)};
          used[j]=true; changed=true;
        }
      }
      merged.push(a);
    }
    boxes=merged;
  }
  return boxes.map(b=>({x:Math.max(0,b.x),y:Math.max(0,b.y),
    w:Math.min(width-b.x,b.w),h:Math.min(height-b.y,b.h)}));
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  AUTO STRAIGHTEN                                                           *
 * ══════════════════════════════════════════════════════════════════════════ */

function runStraightenAll() {
  // Apply straighten to each box rotation via projection angle stored on box
  state.boxes.forEach(box => {
    const angle = estimateAngleForBox(box);
    if (Math.abs(angle) > 0.2 && Math.abs(angle) < 10) {
      box.rotation = (box.rotation || 0) - angle;
    }
  });
  renderStrip();
}

function estimateAngleForBox(box) {
  const canvas = DOM.mainCanvas();
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const x = Math.max(0, Math.round(box.x));
  const y = Math.max(0, Math.round(box.y));
  const w = Math.min(canvas.width  - x, Math.round(box.w));
  const h = Math.min(canvas.height - y, Math.round(box.h));
  if (w < 4 || h < 4) return 0;
  const imgData = ctx.getImageData(x, y, w, h);
  return lightProjectionAngle(imgData);
}

function lightProjectionAngle(imgData) {
  const { width, height, data } = imgData;
  const scale = Math.max(1, Math.floor(width / 200));
  const sw = Math.floor(width / scale), sh = Math.floor(height / scale);
  const gray = new Float32Array(sw * sh);
  for (let y=0;y<sh;y++) for (let x=0;x<sw;x++) {
    const sx=x*scale, sy=y*scale, idx=(sy*width+sx)*4;
    gray[y*sw+x] = (0.299*data[idx]+0.587*data[idx+1]+0.114*data[idx+2])/255;
  }
  let best=0, bestV=-Infinity;
  for (let deg=-8; deg<=8; deg+=0.5) {
    const rad=deg*Math.PI/180, cos=Math.cos(rad), sin=Math.sin(rad);
    const proj=new Float32Array(sh);
    for (let y=0;y<sh;y++) { let s=0;
      for (let x=0;x<sw;x++) {
        const nx=Math.round(x*cos-y*sin), ny=Math.round(x*sin+y*cos);
        if(nx>=0&&nx<sw&&ny>=0&&ny<sh) s+=gray[ny*sw+nx];
      } proj[y]=s; }
    let mean=0; for(const v of proj) mean+=v; mean/=proj.length;
    let variance=0; for(const v of proj) variance+=(v-mean)**2;
    if(variance>bestV){bestV=variance;best=deg;}
  }
  return best;
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  SVG OVERLAY — Bounding Boxes                                              *
 * ══════════════════════════════════════════════════════════════════════════ */

function renderOverlay() {
  const svg = DOM.overlaySvg();
  const canvas = DOM.mainCanvas();

  // Set SVG size to match displayed canvas
  const dw = canvas.offsetWidth  || canvas.width  * state.zoom;
  const dh = canvas.offsetHeight || canvas.height * state.zoom;
  svg.setAttribute('width',  dw);
  svg.setAttribute('height', dh);
  svg.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`);

  svg.innerHTML = '';

  const scaleX = canvas.width  / dw;
  const scaleY = canvas.height / dh;

  state.boxes.forEach((box, idx) => {
    const isSelected = box.id === state.selectedBoxId;
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');

    // Rotation transform around box center
    const cx = box.x + box.w/2, cy = box.y + box.h/2;
    if (box.rotation) {
      g.setAttribute('transform', `rotate(${box.rotation} ${cx} ${cy})`);
    }

    // Main rect
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('class', 'bbox-rect' + (isSelected ? ' selected' : ''));
    rect.setAttribute('x', box.x); rect.setAttribute('y', box.y);
    rect.setAttribute('width', box.w); rect.setAttribute('height', box.h);
    rect.setAttribute('data-id', box.id);
    rect.addEventListener('mousedown', e => startBoxDrag(e, box.id, 'move'));
    rect.addEventListener('touchstart', e => startBoxTouch(e, box.id, 'move'), {passive:false});
    rect.addEventListener('click', e => { e.stopPropagation(); selectBox(box.id); });
    g.appendChild(rect);

    // Label
    const labelText = box.label || `Photo ${idx + 1}`;
    const lbl = document.createElementNS('http://www.w3.org/2000/svg','text');
    lbl.setAttribute('class','bbox-label');
    lbl.setAttribute('x', box.x + box.w/2);
    lbl.setAttribute('y', Math.max(box.y - 6, 14));
    lbl.textContent = labelText;
    g.appendChild(lbl);

    // Resize handles (8 directions)
    if (isSelected) {
      getHandlePoints(box).forEach(([hx, hy, cursor, dir]) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('class','bbox-handle');
        c.setAttribute('cx', hx); c.setAttribute('cy', hy);
        c.setAttribute('r', CONFIG.HANDLE_RADIUS);
        c.setAttribute('data-dir', dir);
        c.style.cursor = cursor;
        c.addEventListener('mousedown', e => { e.stopPropagation(); startBoxDrag(e, box.id, 'handle', dir); });
        c.addEventListener('touchstart', e => { e.stopPropagation(); startBoxTouch(e, box.id, 'handle', dir); }, {passive:false});
        g.appendChild(c);
      });
    }

    svg.appendChild(g);
  });
}

function getHandlePoints(box) {
  const { x, y, w, h } = box;
  const mx = x + w/2, my = y + h/2;
  return [
    [x,    y,    'nw-resize', 'nw'],
    [mx,   y,    'n-resize',  'n'],
    [x+w,  y,    'ne-resize', 'ne'],
    [x+w,  my,   'e-resize',  'e'],
    [x+w,  y+h,  'se-resize', 'se'],
    [mx,   y+h,  's-resize',  's'],
    [x,    y+h,  'sw-resize', 'sw'],
    [x,    my,   'w-resize',  'w'],
  ];
}

function selectBox(id) {
  state.selectedBoxId = (state.selectedBoxId === id) ? null : id;
  renderOverlay();
  // Highlight corresponding strip thumb
  document.querySelectorAll('.split-thumb').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === String(id));
  });
}

/* ── Drag & Resize ──────────────────────────────────────────────────────── */
let _drag = null;

function startBoxDrag(e, id, type, dir = null) {
  e.preventDefault();
  e.stopPropagation();
  selectBox(id);
  const pt = clientToCanvas(e.clientX, e.clientY);
  const box = state.boxes.find(b => b.id === id);
  pushUndo();
  _drag = { type, id, dir, startPt: pt, origBox: { ...box } };
  document.addEventListener('mousemove', onBoxDragMove);
  document.addEventListener('mouseup',   onBoxDragEnd);
}

function startBoxTouch(e, id, type, dir = null) {
  if (e.touches.length !== 1) return;
  e.preventDefault();
  selectBox(id);
  const t = e.touches[0];
  const pt = clientToCanvas(t.clientX, t.clientY);
  const box = state.boxes.find(b => b.id === id);
  pushUndo();
  _drag = { type, id, dir, startPt: pt, origBox: { ...box } };
  document.addEventListener('touchmove', onBoxTouchMove, { passive:false });
  document.addEventListener('touchend',  onBoxTouchEnd);
}

function onBoxDragMove(e) {
  if (!_drag) return;
  const pt = clientToCanvas(e.clientX, e.clientY);
  applyDrag(pt);
}
function onBoxTouchMove(e) {
  if (!_drag || e.touches.length !== 1) return;
  e.preventDefault();
  const t = e.touches[0];
  applyDrag(clientToCanvas(t.clientX, t.clientY));
}

function applyDrag(pt) {
  const dx = pt.x - _drag.startPt.x;
  const dy = pt.y - _drag.startPt.y;
  const box = state.boxes.find(b => b.id === _drag.id);
  if (!box) return;
  const o = _drag.origBox;
  const canvas = DOM.mainCanvas();

  if (_drag.type === 'move') {
    box.x = clamp(o.x + dx, 0, canvas.width  - box.w);
    box.y = clamp(o.y + dy, 0, canvas.height - box.h);
  } else {
    // Handle resize
    let { x, y, w, h } = o;
    const dir = _drag.dir;
    if (dir.includes('e')) w = Math.max(CONFIG.MIN_BOX_PX, o.w + dx);
    if (dir.includes('s')) h = Math.max(CONFIG.MIN_BOX_PX, o.h + dy);
    if (dir.includes('w')) { x = o.x + dx; w = Math.max(CONFIG.MIN_BOX_PX, o.w - dx); }
    if (dir.includes('n')) { y = o.y + dy; h = Math.max(CONFIG.MIN_BOX_PX, o.h - dy); }
    box.x = clamp(x, 0, canvas.width);
    box.y = clamp(y, 0, canvas.height);
    box.w = clamp(w, CONFIG.MIN_BOX_PX, canvas.width  - box.x);
    box.h = clamp(h, CONFIG.MIN_BOX_PX, canvas.height - box.y);
  }
  renderOverlay();
  updateStripThumb(_drag.id);
}

function onBoxDragEnd()  { _drag = null; document.removeEventListener('mousemove', onBoxDragMove); document.removeEventListener('mouseup', onBoxDragEnd); renderStrip(); }
function onBoxTouchEnd() { _drag = null; document.removeEventListener('touchmove', onBoxTouchMove); document.removeEventListener('touchend', onBoxTouchEnd); renderStrip(); }

/* ── Keyboard shortcuts ─────────────────────────────────────────────────── */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    // Don't intercept when typing in input
    if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;

    const NUDGE = e.shiftKey ? 10 : 1;

    switch (e.key) {
      case 'z': case 'Z':
        if (e.ctrlKey || e.metaKey) { e.shiftKey ? redo() : undo(); e.preventDefault(); }
        break;
      case 'y': case 'Y':
        if (e.ctrlKey || e.metaKey) { redo(); e.preventDefault(); }
        break;
      case 'Delete': case 'Backspace':
        if (state.selectedBoxId !== null) { deleteBox(state.selectedBoxId); e.preventDefault(); }
        break;
      case 'ArrowLeft':
        nudgeSelected(-NUDGE, 0); e.preventDefault(); break;
      case 'ArrowRight':
        nudgeSelected(NUDGE,  0); e.preventDefault(); break;
      case 'ArrowUp':
        nudgeSelected(0, -NUDGE); e.preventDefault(); break;
      case 'ArrowDown':
        nudgeSelected(0,  NUDGE); e.preventDefault(); break;
      case 'Escape':
        state.selectedBoxId = null;
        stopCropMode();
        renderOverlay();
        break;
      case '+': case '=':
        zoomIn(); break;
      case '-':
        zoomOut(); break;
      case '0':
        zoomFit(); break;
    }
  });
}

function nudgeSelected(dx, dy) {
  if (state.selectedBoxId === null) return;
  const box = state.boxes.find(b => b.id === state.selectedBoxId);
  if (!box) return;
  const canvas = DOM.mainCanvas();
  pushUndo();
  box.x = clamp(box.x + dx, 0, canvas.width  - box.w);
  box.y = clamp(box.y + dy, 0, canvas.height - box.h);
  renderOverlay();
  updateStripThumb(box.id);
}

function deleteBox(id) {
  pushUndo();
  state.boxes = state.boxes.filter(b => b.id !== id);
  if (state.selectedBoxId === id) state.selectedBoxId = null;
  renderOverlay();
  renderStrip();
  if (state.boxes.length === 0) DOM.splitsPanel().classList.remove('visible');
}

/* ── Add manual crop box ────────────────────────────────────────────────── */
let _cropDraw = null;

function startCropMode() {
  state.cropDrawing = true;
  DOM.canvasWrapper().classList.add('drawing');
  DOM.drawOverlay().classList.add('active');
  DOM.btnAddCrop().classList.add('btn-primary');
  DOM.btnAddCrop().classList.remove('btn-secondary');
  showToast('Draw a rectangle on the scan to add a crop box.', 'info', 4000);
}

function stopCropMode() {
  state.cropDrawing = false;
  DOM.canvasWrapper().classList.remove('drawing');
  DOM.drawOverlay().classList.remove('active');
  DOM.drawPreviewRect().style.display = 'none';
  DOM.btnAddCrop().classList.remove('btn-primary');
  DOM.btnAddCrop().classList.add('btn-secondary');
  _cropDraw = null;
}

function initCropDraw() {
  const overlay = DOM.drawOverlay();
  const preview = DOM.drawPreviewRect();
  const canvasEl = DOM.mainCanvas();

  overlay.addEventListener('mousedown', e => {
    if (!state.cropDrawing) return;
    e.preventDefault();
    const pt = clientToCanvas(e.clientX, e.clientY);
    _cropDraw = { startX: pt.x, startY: pt.y };
    preview.style.display = 'block';
  });

  overlay.addEventListener('mousemove', e => {
    if (!_cropDraw || !state.cropDrawing) return;
    const pt = clientToCanvas(e.clientX, e.clientY);
    const rect = DOM.mainCanvas().getBoundingClientRect();
    // Convert canvas coords back to displayed px for preview rect positioning
    const scaleX = rect.width  / canvasEl.width;
    const scaleY = rect.height / canvasEl.height;
    const displayX = Math.min(_cropDraw.startX, pt.x) * scaleX;
    const displayY = Math.min(_cropDraw.startY, pt.y) * scaleY;
    const displayW = Math.abs(pt.x - _cropDraw.startX) * scaleX;
    const displayH = Math.abs(pt.y - _cropDraw.startY) * scaleY;
    preview.style.left   = displayX + 'px';
    preview.style.top    = displayY + 'px';
    preview.style.width  = displayW + 'px';
    preview.style.height = displayH + 'px';
  });

  overlay.addEventListener('mouseup', e => {
    if (!_cropDraw || !state.cropDrawing) return;
    const pt = clientToCanvas(e.clientX, e.clientY);
    finishCropDraw(pt.x, pt.y);
  });

  // Touch support
  overlay.addEventListener('touchstart', e => {
    if (!state.cropDrawing || e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0];
    const pt = clientToCanvas(t.clientX, t.clientY);
    _cropDraw = { startX: pt.x, startY: pt.y };
    preview.style.display = 'block';
  }, { passive: false });

  overlay.addEventListener('touchend', e => {
    if (!_cropDraw || !state.cropDrawing) return;
    const t = e.changedTouches[0];
    const pt = clientToCanvas(t.clientX, t.clientY);
    finishCropDraw(pt.x, pt.y);
  });
}

function finishCropDraw(endX, endY) {
  if (!_cropDraw) return;
  const norm = normalizeBox(_cropDraw.startX, _cropDraw.startY,
    endX - _cropDraw.startX, endY - _cropDraw.startY);

  if (norm.w > CONFIG.MIN_BOX_PX && norm.h > CONFIG.MIN_BOX_PX) {
    pushUndo();
    state.boxes.push({ id: genId(), ...norm, rotation: 0, label: '' });
    renderOverlay();
    renderStrip();
    DOM.splitsPanel().classList.add('visible');
    showToast('Crop region added.', 'success', 2000);
  }

  DOM.drawPreviewRect().style.display = 'none';
  _cropDraw = null;
  stopCropMode();
}

/* ── Rotate a box ────────────────────────────────────────────────────────── */
function rotateBox(id, degrees) {
  const box = state.boxes.find(b => b.id === id);
  if (!box) return;
  pushUndo();
  box.rotation = ((box.rotation || 0) + degrees + 360) % 360;
  renderOverlay();
  updateStripThumb(id);
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  STRIPS — Thumbnail panel                                                  *
 * ══════════════════════════════════════════════════════════════════════════ */

function renderStrip() {
  const strip = DOM.splitsStrip();
  strip.innerHTML = '';
  DOM.splitsCount().textContent = state.boxes.length;

  state.boxes.forEach((box, idx) => {
    const thumb = createThumbElement(box, idx);
    strip.appendChild(thumb);
  });

  if (state.boxes.length > 0) DOM.splitsPanel().classList.add('visible');
}

function createThumbElement(box, idx) {
  const wrap = document.createElement('div');
  wrap.className = 'split-thumb' + (box.id === state.selectedBoxId ? ' selected' : '');
  wrap.dataset.id = box.id;
  wrap.title = box.label || `Photo ${idx + 1}`;

  // Render thumbnail canvas
  const thumbCanvas = renderBoxToCanvas(box, { maxH: CONFIG.THUMBNAIL_H });
  wrap.appendChild(thumbCanvas);

  // Overlay
  const ov = document.createElement('div');
  ov.className = 'split-thumb-overlay';
  ov.innerHTML = `
    <span class="split-thumb-num">${idx + 1}</span>
    <div class="split-thumb-actions">
      <button class="split-action-btn" title="Rotate 90° CW"  data-action="rotatecw">↻</button>
      <button class="split-action-btn" title="Rotate 90° CCW" data-action="rotateccw">↺</button>
      <button class="split-action-btn" title="Preview" data-action="preview">🔍</button>
      <button class="split-action-btn" title="Delete"  data-action="delete">✕</button>
    </div>`;
  wrap.appendChild(ov);

  if (box.rotation) {
    const badge = document.createElement('div');
    badge.className = 'split-rotation-badge visible';
    badge.textContent = Math.round(box.rotation) + '°';
    wrap.appendChild(badge);
  }

  // Events
  wrap.addEventListener('click', () => { selectBox(box.id); scrollToBox(box.id); });
  ov.querySelector('[data-action="rotatecw"]') .addEventListener('click', e => { e.stopPropagation(); rotateBox(box.id,  90); });
  ov.querySelector('[data-action="rotateccw"]').addEventListener('click', e => { e.stopPropagation(); rotateBox(box.id, -90); });
  ov.querySelector('[data-action="preview"]')  .addEventListener('click', e => { e.stopPropagation(); previewBox(box.id); });
  ov.querySelector('[data-action="delete"]')   .addEventListener('click', e => { e.stopPropagation(); deleteBox(box.id); });

  return wrap;
}

function updateStripThumb(id) {
  const box = state.boxes.find(b => b.id === id);
  if (!box) return;
  const idx = state.boxes.indexOf(box);
  const existing = DOM.splitsStrip().querySelector(`[data-id="${id}"]`);
  if (!existing) return;
  const fresh = createThumbElement(box, idx);
  DOM.splitsStrip().replaceChild(fresh, existing);
}

function scrollToBox(id) {
  const box = state.boxes.find(b => b.id === id);
  if (!box) return;
  // Scroll canvas area to show box center
  const canvas = DOM.mainCanvas();
  const scroll = DOM.canvasScroll();
  const cx = (box.x + box.w/2) * state.zoom;
  const cy = (box.y + box.h/2) * state.zoom;
  const padLeft = (scroll.clientWidth  / 2);
  const padTop  = (scroll.clientHeight / 2);
  scroll.scrollTo({ left: cx - padLeft + 24, top: cy - padTop + 24, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  IMAGE TRANSFORMS                                                          *
 * ══════════════════════════════════════════════════════════════════════════ */

/**
 * Render a single bounding box to an off-screen canvas,
 * applying rotation and optional color enhancement.
 */
function renderBoxToCanvas(box, opts = {}) {
  const srcCanvas = DOM.mainCanvas();
  const ctx = srcCanvas.getContext('2d', { willReadFrequently: true });

  const { rotation = box.rotation || 0, maxH, enhance = false } = opts;

  // Destination canvas
  const dst = document.createElement('canvas');
  const dctx = dst.getContext('2d');

  const radRot = rotation * Math.PI / 180;
  const cos = Math.abs(Math.cos(radRot));
  const sin = Math.abs(Math.sin(radRot));
  const rotW = Math.round(box.w * cos + box.h * sin);
  const rotH = Math.round(box.w * sin + box.h * cos);

  if (maxH) {
    const scale = maxH / rotH;
    dst.width  = Math.round(rotW * scale);
    dst.height = maxH;
    dctx.scale(scale, scale);
  } else {
    dst.width  = rotW;
    dst.height = rotH;
  }

  // Center and rotate
  const halfW = rotW / 2, halfH = rotH / 2;
  dctx.translate(halfW, halfH);
  dctx.rotate(radRot);
  dctx.drawImage(srcCanvas,
    box.x, box.y, box.w, box.h,
    -box.w/2, -box.h/2, box.w, box.h);

  if (enhance || DOM.autoEnhanceToggle()?.checked) {
    autoEnhanceCanvas(dst);
  }

  return dst;
}

/** Simple auto-levels: stretch histogram to [0,255] and boost contrast */
function autoEnhanceCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  let minVal = 255, maxVal = 0;
  for (let i = 0; i < d.length; i += 4) {
    const gray = (d[i] + d[i+1] + d[i+2]) / 3;
    if (gray < minVal) minVal = gray;
    if (gray > maxVal) maxVal = gray;
  }

  // Clip to avoid noise at extremes: take 2nd percentile
  const range = maxVal - minVal || 1;
  const fac = 255 / (range * 0.96);

  for (let i = 0; i < d.length; i += 4) {
    const r = clamp(Math.round((d[i]   - minVal) * fac), 0, 255);
    const g = clamp(Math.round((d[i+1] - minVal) * fac), 0, 255);
    const b = clamp(Math.round((d[i+2] - minVal) * fac), 0, 255);
    d[i]   = r; d[i+1] = g; d[i+2] = b;
  }

  ctx.putImageData(imgData, 0, 0);
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  PREVIEW MODAL                                                             *
 * ══════════════════════════════════════════════════════════════════════════ */

function previewBox(id) {
  const box = state.boxes.find(b => b.id === id);
  if (!box) return;

  const previewCanvas = renderBoxToCanvas(box, { enhance: DOM.autoEnhanceToggle()?.checked });
  const dataUrl = previewCanvas.toDataURL('image/png');

  const idx = state.boxes.indexOf(box);
  DOM.modalTitle().textContent = box.label || `Photo ${idx + 1}`;
  DOM.modalPreviewImg().src = dataUrl;

  DOM.modalActions().innerHTML = `
    <button class="btn btn-secondary" id="modal-rotate-ccw">↺ Rotate CCW</button>
    <button class="btn btn-secondary" id="modal-rotate-cw">↻ Rotate CW</button>
    <button class="btn btn-primary" id="modal-save-one">⬇ Save This Photo</button>
    <button class="btn btn-secondary" id="modal-close">Close</button>
  `;

  $('modal-rotate-cw') .addEventListener('click', () => { rotateBox(id,  90); previewBox(id); });
  $('modal-rotate-ccw').addEventListener('click', () => { rotateBox(id, -90); previewBox(id); });
  $('modal-save-one')  .addEventListener('click', () => { ExportManager.saveOne(id); });
  $('modal-close')     .addEventListener('click', closeModal);

  DOM.modalBackdrop().classList.add('open');
}

function closeModal() {
  DOM.modalBackdrop().classList.remove('open');
}

function initModal() {
  DOM.modalBackdrop().addEventListener('click', e => {
    if (e.target === DOM.modalBackdrop()) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  EXPORT MANAGER                                                            *
 * ══════════════════════════════════════════════════════════════════════════ */

const ExportManager = {
  getSettings() {
    return {
      format:   DOM.formatSelect().value,
      quality:  parseFloat(DOM.qualitySlider().value) / 100,
      baseName: DOM.filenameInput().value.trim() || 'photo_',
    };
  },

  canvasToBlob(canvas, format, quality) {
    return new Promise(resolve => {
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(resolve, mime, quality);
    });
  },

  triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  },

  getFilename(idx, baseName, format) {
    const num = String(idx + 1).padStart(2, '0');
    const ext = format === 'png' ? 'png' : 'jpg';
    return `${baseName}${num}.${ext}`;
  },

  async saveOne(id) {
    const box = state.boxes.find(b => b.id === id);
    if (!box) return;
    const { format, quality, baseName } = this.getSettings();
    const idx = state.boxes.indexOf(box);
    const canvas = renderBoxToCanvas(box, { enhance: DOM.autoEnhanceToggle()?.checked });
    const blob = await this.canvasToBlob(canvas, format, quality);
    this.triggerDownload(blob, this.getFilename(idx, baseName, format));
    showToast(`Saved: ${this.getFilename(idx, baseName, format)}`, 'success');
  },

  async saveAll() {
    if (state.boxes.length === 0) {
      showToast('No splits to save. Run detection or draw crop regions first.', 'warning');
      return;
    }
    const { format, quality, baseName } = this.getSettings();
    showSpinner(`Saving ${state.boxes.length} photos…`);
    setProgress(0, 'Preparing…');

    let saved = 0;
    for (const [idx, box] of state.boxes.entries()) {
      const canvas = renderBoxToCanvas(box, { enhance: DOM.autoEnhanceToggle()?.checked });
      const blob = await this.canvasToBlob(canvas, format, quality);
      this.triggerDownload(blob, this.getFilename(idx, baseName, format));
      saved++;
      setProgress(Math.round(saved / state.boxes.length * 100), `Saving ${saved} of ${state.boxes.length}…`);
      // Small delay to allow browser to process each download
      await new Promise(r => setTimeout(r, 80));
    }

    hideSpinner();
    showToast(`✅ Saved ${saved} photo${saved !== 1 ? 's' : ''}!`, 'success', 4000);
  },
};

/* ══════════════════════════════════════════════════════════════════════════ *
 *  INITIALISATION                                                            *
 * ══════════════════════════════════════════════════════════════════════════ */

function initButtons() {
  DOM.btnDetect()  .addEventListener('click', runDetection);
  DOM.btnAddCrop() .addEventListener('click', () => state.cropDrawing ? stopCropMode() : startCropMode());
  DOM.btnSaveAll() .addEventListener('click', () => ExportManager.saveAll());
  DOM.btnUndo()    .addEventListener('click', undo);
  DOM.btnRedo()    .addEventListener('click', redo);
  DOM.btnZoomIn()  .addEventListener('click', zoomIn);
  DOM.btnZoomOut() .addEventListener('click', zoomOut);
  DOM.btnZoomFit() .addEventListener('click', zoomFit);
  DOM.darkToggle() .addEventListener('click', toggleDarkMode);

  // Format / quality
  DOM.formatSelect().addEventListener('change', () => {
    const isPng = DOM.formatSelect().value === 'png';
    $('quality-row').style.display = isPng ? 'none' : 'flex';
  });

  DOM.qualitySlider().addEventListener('input', () => {
    DOM.qualityVal().textContent = DOM.qualitySlider().value + '%';
  });

  DOM.bgThresholdSlider().addEventListener('input', () => {
    DOM.bgThresholdVal().textContent = DOM.bgThresholdSlider().value;
  });

  DOM.minAreaSlider().addEventListener('input', () => {
    DOM.minAreaVal().textContent = DOM.minAreaSlider().value + '%';
  });

  // Click on SVG background = deselect
  DOM.overlaySvg().addEventListener('click', e => {
    if (e.target === DOM.overlaySvg()) { state.selectedBoxId = null; renderOverlay(); }
  });
}

function init() {
  refreshUndoButtons();
  initFileManager();
  initKeyboard();
  initZoomWheel();
  initCropDraw();
  initModal();
  initButtons();
  spawnWorker();

  // Check system dark mode preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    state.darkMode = true;
    document.documentElement.dataset.theme = 'dark';
  }

  // Handle window resize — re-fit zoom
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (state.activeFileIdx >= 0) {
        renderOverlay();
      }
    }, 150);
  });

  console.log('%cPhotoSplit Studio loaded — zero network requests for your images.', 'color:#6366f1;font-weight:bold;font-size:14px');
}

document.addEventListener('DOMContentLoaded', init);

/* ══════════════════════════════════════════════════════════════════════════ *
 *  GLOBAL EXPORTS — accessible from HTML onclick attributes                  *
 * ══════════════════════════════════════════════════════════════════════════ */
window.ExportManager  = ExportManager;
window.applyZoom      = applyZoom;
window.zoomIn         = zoomIn;
window.zoomOut        = zoomOut;
window.zoomFit        = zoomFit;
window.closeModal     = closeModal;
window.previewBox     = previewBox;
window.deleteBox      = deleteBox;
window.rotateBox      = rotateBox;
window.selectBox      = selectBox;
