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
  filmBaseColor: null, // { r, g, b }
  pickingFilmBase: false,
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
  filmTypeSelect:   () => $('film-type-select'),
  btnDetect:        () => $('btn-detect'),
  btnAddCrop:       () => $('btn-add-crop'),
  btnSaveAll:       () => $('btn-save-all'),
  btnUndo:          () => $('btn-undo'),
  btnRedo:          () => $('btn-redo'),
  btnZoomIn:        () => $('btn-zoom-in'),
  btnZoomOut:       () => $('btn-zoom-out'),
  btnZoomFit:       () => $('btn-zoom-fit'),
  negativeProTools: () => $('negative-pro-tools'),
  btnPickFilmBase:  () => $('btn-pick-film-base'),
  negativeClaheToggle: () => $('negative-clahe-toggle'),
  convertNegativeToggle: () => $('convert-negative-toggle'),
  sharpenToggle:    () => $('sharpen-toggle'),
  sharpenAmountRow: () => $('sharpen-amount-row'),
  sharpenAmountSlider: () => $('sharpen-amount-slider'),
  colorizeBwToggle: () => $('colorize-bw-toggle'),
  colorFilterSelect:() => $('color-filter-select'),
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
  saveSession();
}

function undo() {
  if (!state.undoStack.length) return;
  state.redoStack.push(deepCloneBoxes());
  state.boxes = state.undoStack.pop();
  state.selectedBoxId = null;
  refreshUndoButtons();
  renderOverlay();
  renderStrip();
  saveSession();
}

function redo() {
  if (!state.redoStack.length) return;
  state.undoStack.push(deepCloneBoxes());
  state.boxes = state.redoStack.pop();
  state.selectedBoxId = null;
  refreshUndoButtons();
  renderOverlay();
  renderStrip();
  saveSession();
}

function saveSession() {
  if (state.activeFileIdx < 0 || !state.files[state.activeFileIdx]) return;
  const currentFile = state.files[state.activeFileIdx];
  const sessionData = { filename: currentFile.name, boxes: state.boxes };
  localStorage.setItem('photosplit_session', JSON.stringify(sessionData));
}

function restoreSession(currentFile) {
  try {
    const data = JSON.parse(localStorage.getItem('photosplit_session'));
    if (data && data.filename === currentFile.name && data.boxes && data.boxes.length > 0) {
      state.boxes = data.boxes;
      showToast('Restored previous session', 'info', 2000);
      return true;
    }
  } catch(e) {}
  return false;
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

const ALLOWED_TYPES = ['image/jpeg','image/png','image/tiff','image/bmp','image/gif','image/webp','application/pdf'];


async function handleFiles(files) {
  const valid = files.filter(f => ALLOWED_TYPES.includes(f.type) ||
    /\.(jpe?g|png|tiff?|bmp|gif|webp|pdf)$/i.test(f.name));

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
      if (file.type === 'application/pdf' || /\.(pdf)$/i.test(file.name)) {
        const pages = await loadPdfPages(file);
        for (let i = 0; i < pages.length; i++) {
          const pageName = pages.length > 1 ? `${file.name} - Page ${i+1}` : file.name;
          if (!state.files.find(f => f.name === pageName)) {
            state.files.push({ file, img: pages[i], name: pageName });
            addFileChip(state.files.length - 1);
          }
        }
      } else {
        const img = await loadImageFile(file);
        state.files.push({ file, img, name: file.name });
        addFileChip(state.files.length - 1);
      }
    } catch (err) {
      showToast(`Could not load ${file.name}: ${err.message}`, 'error');
    }
    hideSpinner();
  }

  if (state.activeFileIdx < 0 && state.files.length > 0) {
    activateFile(0);
  }
}

async function loadPdfPages(file) {
  if (typeof pdfjsLib === 'undefined') throw new Error('PDF support library is not available.');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const canvases = [];
  const scale = 2.0; // Render at 2x scale
  for (let num = 1; num <= pdf.numPages; num++) {
    const page = await pdf.getPage(num);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    canvases.push(canvas);
  }
  return canvases;
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
  // Rebuild the whole list so IDs stay consistent
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
  const sessionRestored = restoreSession(entry);

  drawScanToCanvas(entry.img);
  showCanvas();
  zoomFit();
  renderOverlay();
  renderStrip();
  DOM.splitsPanel().classList.remove('visible');
  if (state.boxes.length > 0) DOM.splitsPanel().classList.add('visible');

  if (!sessionRestored) {
    showToast(`Loaded: ${entry.name} — detecting photos…`, 'info', 2500);
    // Yield one frame so the canvas renders before we pull ImageData
    setTimeout(() => runDetection(), 120);
  } else {
    showToast(`Loaded: ${entry.name}`, 'info', 2000);
  }
}

// Async wrappers for batch processing
async function activateFileAsync(idx) {
  return new Promise(resolve => {
    activateFile(idx);
    setTimeout(resolve, 50); // Yield to render
  });
}

function runDetectionAsync() {
  return new Promise(resolve => {
    runDetection();
    if (!state.workerBusy) { resolve(); return; }
    
    const check = setInterval(() => {
      if (!state.workerBusy) {
        clearInterval(check);
        resolve();
      }
    }, 100);
  });
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
 *  SCAN ROTATION — rotate the whole loaded image CW / CCW                   *
 * ══════════════════════════════════════════════════════════════════════════ */

function rotateScan(degrees) {
  if (state.activeFileIdx < 0) { showToast('Upload a scan first.', 'warning'); return; }

  const entry   = state.files[state.activeFileIdx];
  const srcCanvas = DOM.mainCanvas();
  const W = srcCanvas.width;
  const H = srcCanvas.height;

  // Build a new off-screen canvas with swapped dimensions (for ±90°)
  const tmp  = document.createElement('canvas');
  const rad  = degrees * Math.PI / 180;
  const cos  = Math.abs(Math.cos(rad));
  const sin  = Math.abs(Math.sin(rad));
  tmp.width  = Math.round(W * cos + H * sin);
  tmp.height = Math.round(W * sin + H * cos);

  const ctx = tmp.getContext('2d');
  ctx.translate(tmp.width / 2, tmp.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(srcCanvas, -W / 2, -H / 2);

  // Replace the stored image with the rotated canvas so detection + export use it
  entry.img = tmp;

  // Clear boxes and redraw
  pushUndo();
  state.boxes = [];
  state.selectedBoxId = null;
  drawScanToCanvas(tmp);
  zoomFit();
  renderOverlay();
  renderStrip();
  DOM.splitsPanel().classList.remove('visible');

  const label = degrees === 90 ? '90° clockwise' : degrees === -90 ? '90° counter-clockwise' : `${degrees}°`;
  showToast(`Scan rotated ${label} — re-detecting…`, 'info', 2500);
  setTimeout(() => runDetection(), 120);
}

window.rotateScan = rotateScan;



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

/**
 * Sampling the color from the canvas at specific coordinates
 */
function sampleColorAt(cx, cy) {
  const canvas = DOM.mainCanvas();
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const pos = clientToCanvas(cx, cy);
  const data = ctx.getImageData(clamp(pos.x, 0, canvas.width - 1), clamp(pos.y, 0, canvas.height - 1), 1, 1).data;
  return { r: data[0], g: data[1], b: data[2] };
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
      // Per-box straighten results are handled by direct listeners in runStraightenAll.
      // This global fallback just clears the busy flag if somehow triggered elsewhere.
      state.workerBusy = false;
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

  // Negatives have a dark background — invert a copy so the bright-background
  // OpenCV pipeline can still detect photo boundaries correctly.
  const isNegative = DOM.convertNegativeToggle()?.checked;
  let detectImageData = imageData;
  if (isNegative) {
    const invertedData = new Uint8ClampedArray(imageData.data);
    for (let i = 0; i < invertedData.length; i += 4) {
      invertedData[i]   = 255 - invertedData[i];
      invertedData[i+1] = 255 - invertedData[i+1];
      invertedData[i+2] = 255 - invertedData[i+2];
      // alpha unchanged
    }
    detectImageData = new ImageData(invertedData, imageData.width, imageData.height);
  }

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
    state.worker.postMessage({ type: 'DETECT_PHOTOS', imageData: detectImageData, options: opts },
      [detectImageData.data.buffer]);
  } else {
    showToast('Web worker not initialized. Cannot run detection.', 'error');
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
    rotation: b.suggestedAngle || 0,
    label: '',
  }));
  state.selectedBoxId = null;

  if (DOM.autoStraightenToggle()?.checked) {
    runStraightenAll();
  }

  renderOverlay();
  renderStrip();
  DOM.splitsPanel().classList.add('visible');
  if (typeof gtag !== 'undefined') gtag('event', 'photos_detected', { count: state.boxes.length });
  showToast(`Detected ${state.boxes.length} photo${state.boxes.length !== 1 ? 's' : ''}.`, 'success');
}











/* ══════════════════════════════════════════════════════════════════════════ *
 *  AUTO STRAIGHTEN                                                           *
 * ══════════════════════════════════════════════════════════════════════════ */

async function runStraightenAll() {
  const canvas = DOM.mainCanvas();
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const promises = state.boxes.map(box => new Promise(resolve => {
    const x = Math.max(0, Math.round(box.x));
    const y = Math.max(0, Math.round(box.y));
    const w = Math.min(canvas.width  - x, Math.round(box.w));
    const h = Math.min(canvas.height - y, Math.round(box.h));
    if (w < 8 || h < 8) { resolve(0); return; }

    const cropData = ctx.getImageData(x, y, w, h);

    if (state.worker) {
      // Use OpenCV-based angle detection in the worker
      const timeout = setTimeout(() => {
        // Fallback to JS method if worker doesn't respond in 5s
        resolve(estimateAngleForBox(box));
      }, 5000);

      const handler = (e) => {
        if (e.data.type === 'STRAIGHTEN_DONE') {
          clearTimeout(timeout);
          state.worker.removeEventListener('message', handler);
          resolve(e.data.angle || 0);
        }
      };
      state.worker.addEventListener('message', handler);
      state.worker.postMessage(
        { type: 'STRAIGHTEN_ANALYZE', imageData: cropData, options: {} },
        [cropData.data.buffer]
      );
    } else {
      resolve(lightProjectionAngle(cropData));
    }
  }));

  const angles = await Promise.all(promises);
  angles.forEach((angle, i) => {
    const box = state.boxes[i];
    if (Math.abs(angle) > 0.3 && Math.abs(angle) < 30) {
      box.rotation = ((box.rotation || 0) + angle + 360) % 360;
    }
  });
  renderOverlay();
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
  if (typeof CollageManager !== 'undefined' && $('collage-modal') && $('collage-modal').getAttribute('aria-hidden') === 'false') {
    CollageManager.toggleSelection(id);
    return;
  }
  
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
      case 'e': case 'E':
        if (state.selectedBoxId !== null) { rotateBox(state.selectedBoxId, 90); e.preventDefault(); }
        break;
      case 'q': case 'Q':
        if (state.selectedBoxId !== null) { rotateBox(state.selectedBoxId, -90); e.preventDefault(); }
        break;
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

async function renderStrip() {
  const strip = DOM.splitsStrip();
  strip.innerHTML = '';
  DOM.splitsCount().textContent = state.boxes.length;

  const thumbPromises = state.boxes.map((box, idx) => createThumbElement(box, idx));
  const thumbs = await Promise.all(thumbPromises);
  thumbs.forEach(thumb => strip.appendChild(thumb));

  if (state.boxes.length > 0) DOM.splitsPanel().classList.add('visible');
}

async function createThumbElement(box, idx) {
  const wrap = document.createElement('div');
  
  let thumbClass = 'split-thumb';
  if (typeof CollageManager !== 'undefined' && $('collage-modal') && $('collage-modal').getAttribute('aria-hidden') === 'false') {
    if (CollageManager.selectedIds.includes(box.id)) thumbClass += ' selected';
  } else {
    if (box.id === state.selectedBoxId) thumbClass += ' selected';
  }
  wrap.className = thumbClass;
  
  wrap.dataset.id = box.id;
  wrap.title = box.label || `Photo ${idx + 1}`;

  // Render thumbnail canvas
  const thumbCanvas = await renderBoxToCanvas(box, { maxH: CONFIG.THUMBNAIL_H });
  wrap.appendChild(thumbCanvas);


  // Overlay
  const ov = document.createElement('div');
  ov.className = 'split-thumb-overlay';
  ov.innerHTML = `
    <span class="split-thumb-num">${idx + 1}</span>
    <div class="split-thumb-actions">
      <button class="split-action-btn" title="Rotate 90° CW"  data-action="rotatecw">↻</button>
      <button class="split-action-btn" title="Rotate 90° CCW" data-action="rotateccw">↺</button>
      <button class="split-action-btn" title="Edit Details" data-action="edit">📝</button>
      <button class="split-action-btn" title="Extract Text (OCR)" data-action="ocr">🔤</button>
      <button class="split-action-btn" title="Preview" data-action="preview">🔍</button>
      <button class="split-action-btn" title="Copy to Clipboard" data-action="copy">📋</button>
      <button class="split-action-btn" title="Share" data-action="share">📤</button>
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
  wrap.draggable = true;
  wrap.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', idx);
    wrap.classList.add('dragging');
  });
  wrap.addEventListener('dragend', () => wrap.classList.remove('dragging'));
  wrap.addEventListener('dragover', e => {
    e.preventDefault();
    wrap.classList.add('drag-over');
  });
  wrap.addEventListener('dragleave', () => wrap.classList.remove('drag-over'));
  wrap.addEventListener('drop', e => {
    e.preventDefault();
    wrap.classList.remove('drag-over');
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const toIdx = idx;
    if (fromIdx !== toIdx && !isNaN(fromIdx)) {
      const moved = state.boxes.splice(fromIdx, 1)[0];
      state.boxes.splice(toIdx, 0, moved);
      pushUndo();
      renderStrip();
    }
  });

  wrap.addEventListener('click', () => { selectBox(box.id); scrollToBox(box.id); });
  ov.querySelector('[data-action="rotatecw"]') .addEventListener('click', e => { e.stopPropagation(); rotateBox(box.id,  90); });
  ov.querySelector('[data-action="rotateccw"]').addEventListener('click', e => { e.stopPropagation(); rotateBox(box.id, -90); });
  ov.querySelector('[data-action="edit"]')     .addEventListener('click', e => { e.stopPropagation(); openMetadataModal(box.id); });
  ov.querySelector('[data-action="ocr"]')      .addEventListener('click', e => { e.stopPropagation(); OCRManager.extractText(box.id); });
  ov.querySelector('[data-action="preview"]')  .addEventListener('click', e => { e.stopPropagation(); previewBox(box.id); });
  ov.querySelector('[data-action="copy"]')     .addEventListener('click', e => { e.stopPropagation(); copyBoxToClipboard(box.id); });
  ov.querySelector('[data-action="share"]')    .addEventListener('click', e => { e.stopPropagation(); SocialManager.openModal(box.id); });
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
async function renderBoxToCanvas(box, opts = {}) {
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

  const doEnhance  = enhance  !== undefined ? enhance  : DOM.autoEnhanceToggle()?.checked;
  const filmType   = opts.filmType !== undefined ? opts.filmType : (DOM.filmTypeSelect()?.value || 'none');

  if (filmType !== 'none') {
    await convertNegativeCanvasAsync(dst, filmType);
  } else if (doEnhance) {
    autoEnhanceCanvas(dst);
  }

  // ── NEW ENHANCEMENTS (Photomyne Feature Parity) ──
  const doSharpen    = DOM.sharpenToggle()?.checked;
  const sharpenAmount= parseInt(DOM.sharpenAmountSlider()?.value || 5, 10);
  const doColorize   = DOM.colorizeBwToggle()?.checked;
  const colorFilter  = DOM.colorFilterSelect()?.value || 'none';

  if (doSharpen || doColorize || colorFilter !== 'none') {
    const imgData = dctx.getImageData(0, 0, dst.width, dst.height);
    if (doSharpen) applySharpen(imgData, sharpenAmount);
    if (doColorize) applyColorization(imgData);
    if (colorFilter !== 'none') applyColorFilter(imgData, colorFilter);
    dctx.putImageData(imgData, 0, 0);
  }

  return dst;
}

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  PHASE 1 ENHANCEMENTS                                                       *
 * ═══════════════════════════════════════════════════════════════════════════ */

function applySharpen(imgData, amount) {
  // Amount 1-10 mapped to mix ratio 0.2 - 2.0
  const mix = amount * 0.2;
  const data = imgData.data;
  const w = imgData.width;
  const h = imgData.height;
  const blurred = new Uint8ClampedArray(data.length);
  
  // Fast 3x3 box blur
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nidx = (ny * w + nx) * 4;
            r += data[nidx];
            g += data[nidx+1];
            b += data[nidx+2];
            count++;
          }
        }
      }
      blurred[idx] = r / count;
      blurred[idx+1] = g / count;
      blurred[idx+2] = b / count;
    }
  }
  
  // Unsharp mask: orig + mix * (orig - blur)
  for (let i = 0; i < data.length; i += 4) {
    data[i]   = Math.max(0, Math.min(255, data[i]   + mix * (data[i]   - blurred[i])));
    data[i+1] = Math.max(0, Math.min(255, data[i+1] + mix * (data[i+1] - blurred[i+1])));
    data[i+2] = Math.max(0, Math.min(255, data[i+2] + mix * (data[i+2] - blurred[i+2])));
  }
}

function applyColorFilter(imgData, filterName) {
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i+1], b = data[i+2];
    if (filterName === 'vivid') {
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.min(255, l + (r - l) * 1.5);
      g = Math.min(255, l + (g - l) * 1.5);
      b = Math.min(255, l + (b - l) * 1.5);
    } else if (filterName === 'cool') {
      r = Math.max(0, r - 10);
      b = Math.min(255, b + 20);
    } else if (filterName === 'warm') {
      r = Math.min(255, r + 20);
      g = Math.min(255, g + 10);
      b = Math.max(0, b - 15);
    } else if (filterName === 'sepia') {
      const tr = 0.393 * r + 0.769 * g + 0.189 * b;
      const tg = 0.349 * r + 0.686 * g + 0.168 * b;
      const tb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = Math.min(255, tr);
      g = Math.min(255, tg);
      b = Math.min(255, tb);
    } else if (filterName === 'matte') {
      r = r * 0.8 + 30;
      g = g * 0.8 + 30;
      b = b * 0.8 + 30;
    }
    data[i] = r; data[i+1] = g; data[i+2] = b;
  }
}

function applyColorization(imgData) {
  const data = imgData.data;
  const w = imgData.width;
  const h = imgData.height;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i], g = data[i+1], b = data[i+2];
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      const yNorm = y / h;
      
      let cr = l, cg = l, cb = l;
      
      if (l > 220) {
        // Bright highlights / sky
        cr = Math.min(255, l * 1.05);
        cg = Math.min(255, l * 1.02);
        cb = Math.min(255, l * 0.95);
      } else if (yNorm < 0.35 && l > 120) {
        // Upper region (sky)
        cr = l * 0.8; cg = l * 0.9; cb = Math.min(255, l * 1.2);
      } else if (l > 100 && l < 180) {
        // Midtones (faces, ground)
        cr = Math.min(255, l * 1.15);
        cg = Math.min(255, l * 1.05);
        cb = l * 0.85;
      } else if (l >= 40 && l <= 100) {
        // Shadows / vegetation
        cr = l * 0.9; cg = Math.min(255, l * 1.1); cb = l * 0.9;
      } else {
        // Dark shadows (cool)
        cr = l * 0.9; cg = l * 0.9; cb = Math.min(255, l * 1.1);
      }
      
      // Blend original luma 60% with color 40%
      data[i]   = Math.min(255, l * 0.6 + cr * 0.4);
      data[i+1] = Math.min(255, l * 0.6 + cg * 0.4);
      data[i+2] = Math.min(255, l * 0.6 + cb * 0.4);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  FILM NEGATIVE CONVERTOR                                                   *
 *  Professional-grade algorithms for B&W, Color C-41, and Slide E-6         *
 *  All color work performed in LINEAR LIGHT (not gamma-encoded sRGB)         *
 * ═══════════════════════════════════════════════════════════════════════════ */

// Pre-compute sRGB ↔ linear light LUTs for speed
const _toLinear = (() => {
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const v = i / 255;
    lut[i] = v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  return lut;
})();

const _toSRGB8 = (() => {
  const lut = new Uint8ClampedArray(4096);
  for (let i = 0; i < 4096; i++) {
    const v = Math.max(0, Math.min(1, i / 4095));
    const s = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    lut[i] = Math.round(s * 255);
  }
  return lut;
})();

function _linearToSRGB8(v) {
  return _toSRGB8[Math.round(Math.max(0, Math.min(1, v)) * 4095)];
}

/**
 * Central dispatcher — call with filmType: 'bw' | 'color' | 'slide'
 */
function convertNegativeCanvas(canvas, filmType) {
  const useClahe = DOM.negativeClaheToggle()?.checked;
  const filmBase = state.filmBaseColor;

  // We have a choice: 
  // 1. synchronous JS-based conversion (current)
  // 2. asynchronous worker-based OpenCV conversion (better Quality)
  // Since renderBoxToCanvas is synchronous in many places, we'll try to keep the
  // existing JS logic but improve it, OR we make the whole export pipeline async.
  // For now, let's stick to syncing for simplicity in UI, but if 'color' is selected
  // we use the filmBase if available.

  switch (filmType) {
    case 'bw':    _convertBWNegative(canvas);    break;
    case 'color': _convertColorNegative(canvas, filmBase); break;
    case 'slide': _convertSlide(canvas);          break;
  }
}

/**
 * ASYNC version of converter using the worker (PRO)
 */
async function convertNegativeCanvasAsync(canvas, filmType) {
  if (!state.worker) return convertNegativeCanvas(canvas, filmType);
  
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const options = {
    filmType,
    filmBase: state.filmBaseColor,
    useClahe: DOM.negativeClaheToggle()?.checked
  };

  return new Promise((resolve, reject) => {
    const handler = (e) => {
      if (e.data.type === 'PROCESS_DONE') {
        state.worker.removeEventListener('message', handler);
        ctx.putImageData(e.data.imageData, 0, 0);
        resolve();
      } else if (e.data.type === 'ERROR') {
        state.worker.removeEventListener('message', handler);
        reject(new Error(e.data.message));
      }
    };
    state.worker.addEventListener('message', handler);
    state.worker.postMessage({ type: 'PROCESS_NEGATIVE', imageData, options }, [imageData.data.buffer]);
  });
}


/**
 * B&W NEGATIVE CONVERSION
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Convert to linear light
 * 2. Invert each channel
 * 3. Per-channel percentile stretch (clip 0.5% shadows + highlights)
 * 4. Apply gamma back to sRGB
 */
function _convertBWNegative(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const imgData = ctx.getImageData(0, 0, W, H);
  const d = imgData.data;
  const len = d.length;
  const pc = len / 4;

  // 1. To linear + invert
  const linR = new Float32Array(pc);
  const linG = new Float32Array(pc);
  const linB = new Float32Array(pc);
  for (let i = 0, p = 0; i < len; i += 4, p++) {
    linR[p] = 1 - _toLinear[d[i]];
    linG[p] = 1 - _toLinear[d[i + 1]];
    linB[p] = 1 - _toLinear[d[i + 2]];
  }

  // 2. Per-channel percentile stretch (0.5% clip each end)
  const { lo: rLo, hi: rHi } = _percentileRange(linR, 0.005);
  const { lo: gLo, hi: gHi } = _percentileRange(linG, 0.005);
  const { lo: bLo, hi: bHi } = _percentileRange(linB, 0.005);

  const rRange = (rHi - rLo) || 1;
  const gRange = (gHi - gLo) || 1;
  const bRange = (bHi - bLo) || 1;

  // 3. Normalise and write back in sRGB
  for (let i = 0, p = 0; i < len; i += 4, p++) {
    d[i]     = _linearToSRGB8((linR[p] - rLo) / rRange);
    d[i + 1] = _linearToSRGB8((linG[p] - gLo) / gRange);
    d[i + 2] = _linearToSRGB8((linB[p] - bLo) / bRange);
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * COLOR NEGATIVE CONVERSION (C-41)
 * ─────────────────────────────────────────────────────────────────────────
 * This is the "orange mask" problem. C-41 film has a strong orange base
 * that causes a simple inversion to produce a blue/cyan mess.
 *
 * Algorithm (matches professional scanner software like Epson Scan / Silverfast):
 * 1. Analyse the BRIGHTEST pixels per channel — these represent the unexposed
 *    film base a.k.a. the orange mask reference.
 * 2. Convert entire image to linear light.
 * 3. Divide each channel by its film-base reference  →  mask removed.
 * 4. Invert  →  now you have a positive with balanced colours.
 * 5. Per-channel percentile stretch for final tonal range.
 * 6. Convert back to sRGB gamma.
 */
function _convertColorNegative(canvas, customBase = null) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const imgData = ctx.getImageData(0, 0, W, H);
  const d = imgData.data;
  const len = d.length;
  const pc  = len / 4;

  let filmBaseR, filmBaseG, filmBaseB;
  
  if (customBase) {
    filmBaseR = customBase.r;
    filmBaseG = customBase.g;
    filmBaseB = customBase.b;
  } else {
    // Step 1a: Build histograms to find the film-base (orange mask) reference.
    const histR = new Int32Array(256);
    const histG = new Int32Array(256);
    const histB = new Int32Array(256);
    for (let i = 0; i < len; i += 4) {
      histR[d[i]]++; histG[d[i + 1]]++; histB[d[i + 2]]++;
    }
    filmBaseR = _histPercentileVal(histR, pc, 0.98);
    filmBaseG = _histPercentileVal(histG, pc, 0.98);
    filmBaseB = _histPercentileVal(histB, pc, 0.98);
  }


  // Convert film base to linear light (minimum value to avoid div/0)
  const lBaseR = Math.max(0.001, _toLinear[filmBaseR]);
  const lBaseG = Math.max(0.001, _toLinear[filmBaseG]);
  const lBaseB = Math.max(0.001, _toLinear[filmBaseB]);

  // Step 2-4: For each pixel, convert to linear → divide by base → invert
  const linR = new Float32Array(pc);
  const linG = new Float32Array(pc);
  const linB = new Float32Array(pc);
  for (let i = 0, p = 0; i < len; i += 4, p++) {
    // Divide by film base removes the orange mask; clamped to [0,1] before invert
    linR[p] = Math.max(0, 1 - Math.min(1, _toLinear[d[i]]     / lBaseR));
    linG[p] = Math.max(0, 1 - Math.min(1, _toLinear[d[i + 1]] / lBaseG));
    linB[p] = Math.max(0, 1 - Math.min(1, _toLinear[d[i + 2]] / lBaseB));
  }

  // Step 5: Per-channel percentile stretch for final tonal range (1% clip each end)
  const { lo: rLo, hi: rHi } = _percentileRange(linR, 0.01);
  const { lo: gLo, hi: gHi } = _percentileRange(linG, 0.01);
  const { lo: bLo, hi: bHi } = _percentileRange(linB, 0.01);
  const rRange = (rHi - rLo) || 1;
  const gRange = (gHi - gLo) || 1;
  const bRange = (bHi - bLo) || 1;

  // Step 6: Write output in sRGB gamma
  for (let i = 0, p = 0; i < len; i += 4, p++) {
    d[i]     = _linearToSRGB8((linR[p] - rLo) / rRange);
    d[i + 1] = _linearToSRGB8((linG[p] - gLo) / gRange);
    d[i + 2] = _linearToSRGB8((linB[p] - bLo) / bRange);
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * SLIDE / E-6 POSITIVE CONVERSION
 * ─────────────────────────────────────────────────────────────────────────
 * E-6 slides are directly-viewed positives. They look vivid when lit from
 * behind, but scanned against a white backlight they need simple inversion
 * plus mild per-channel correction to recover white balance.
 */
function _convertSlide(canvas) {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const len = d.length;
  const pc = len / 4;

  // Simple inversion in linear light
  const linR = new Float32Array(pc);
  const linG = new Float32Array(pc);
  const linB = new Float32Array(pc);
  for (let i = 0, p = 0; i < len; i += 4, p++) {
    linR[p] = 1 - _toLinear[d[i]];
    linG[p] = 1 - _toLinear[d[i + 1]];
    linB[p] = 1 - _toLinear[d[i + 2]];
  }

  // Tighter 0.25% stretch — slides have less latitude than negatives
  const { lo: rLo, hi: rHi } = _percentileRange(linR, 0.0025);
  const { lo: gLo, hi: gHi } = _percentileRange(linG, 0.0025);
  const { lo: bLo, hi: bHi } = _percentileRange(linB, 0.0025);
  const rRange = (rHi - rLo) || 1;
  const gRange = (gHi - gLo) || 1;
  const bRange = (bHi - bLo) || 1;

  for (let i = 0, p = 0; i < len; i += 4, p++) {
    d[i]     = _linearToSRGB8((linR[p] - rLo) / rRange);
    d[i + 1] = _linearToSRGB8((linG[p] - gLo) / gRange);
    d[i + 2] = _linearToSRGB8((linB[p] - bLo) / bRange);
  }

  ctx.putImageData(imgData, 0, 0);
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Find lo and hi percentile clipping points of a Float32Array */
function _percentileRange(arr, clip) {
  const sorted = arr.slice().sort();
  const lo = sorted[Math.floor(clip * sorted.length)] || 0;
  const hi = sorted[Math.floor((1 - clip) * sorted.length)] || 1;
  return { lo, hi: Math.max(hi, lo + 0.001) };
}

/** Return the integer value at the given percentile from a 256-bin histogram */
function _histPercentileVal(hist, total, pct) {
  const target = total * pct;
  let acc = 0;
  // Scan from HIGH end (brightest pixels are the film base in a negative)
  for (let v = 255; v >= 0; v--) {
    acc += hist[v];
    if (acc >= target) return v;
  }
  return 255;
}

/** Auto-levels: per-channel histogram stretch (for NORMAL photos, not negatives) */
function autoEnhanceCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const len = d.length;
  const pc = len / 4;

  const histR = new Int32Array(256);
  const histG = new Int32Array(256);
  const histB = new Int32Array(256);
  for (let i = 0; i < len; i += 4) {
    histR[d[i]]++; histG[d[i+1]]++; histB[d[i+2]]++;
  }

  const clip = pc * 0.005;
  let rLo = 0, rHi = 255, gLo = 0, gHi = 255, bLo = 0, bHi = 255;
  let acc = 0;
  for (let v = 0;   v < 256; v++) { acc += histR[v]; if (acc >= clip) { rLo = v; break; } } acc = 0;
  for (let v = 255; v >= 0;  v--) { acc += histR[v]; if (acc >= clip) { rHi = v; break; } } acc = 0;
  for (let v = 0;   v < 256; v++) { acc += histG[v]; if (acc >= clip) { gLo = v; break; } } acc = 0;
  for (let v = 255; v >= 0;  v--) { acc += histG[v]; if (acc >= clip) { gHi = v; break; } } acc = 0;
  for (let v = 0;   v < 256; v++) { acc += histB[v]; if (acc >= clip) { bLo = v; break; } } acc = 0;
  for (let v = 255; v >= 0;  v--) { acc += histB[v]; if (acc >= clip) { bHi = v; break; } }

  const rF = 255 / ((rHi - rLo) || 1);
  const gF = 255 / ((gHi - gLo) || 1);
  const bF = 255 / ((bHi - bLo) || 1);

  for (let i = 0; i < len; i += 4) {
    d[i]   = clamp(Math.round((d[i]   - rLo) * rF), 0, 255);
    d[i+1] = clamp(Math.round((d[i+1] - gLo) * gF), 0, 255);
    d[i+2] = clamp(Math.round((d[i+2] - bLo) * bF), 0, 255);
  }

  ctx.putImageData(imgData, 0, 0);
}


async function previewBox(id) {
  const box = state.boxes.find(b => b.id === id);
  if (!box) return;

  const previewCanvas = await renderBoxToCanvas(box);
  const dataUrl = previewCanvas.toDataURL('image/png');

  const idx = state.boxes.indexOf(box);
  DOM.modalTitle().textContent = box.label || `Photo ${idx + 1}`;
  DOM.modalPreviewImg().src = dataUrl;

  const actionsEl = DOM.modalActions();
  actionsEl.innerHTML = `
    <button class="btn btn-secondary" id="modal-rotate-ccw">↺ Rotate CCW</button>
    <button class="btn btn-secondary" id="modal-rotate-cw">↻ Rotate CW</button>
    <button class="btn btn-primary" id="modal-save-one">⬇ Save This Photo</button>
    <button class="btn btn-secondary" id="modal-share-one">📤 Share</button>
    <button class="btn btn-secondary" id="modal-ba-toggle" style="display:none">🔄 Before/After</button>
    <button class="btn btn-secondary" id="modal-close">Close</button>
  `;

  $('modal-rotate-cw') .addEventListener('click', () => { rotateBox(id,  90); previewBox(id); });
  $('modal-rotate-ccw').addEventListener('click', () => { rotateBox(id, -90); previewBox(id); });
  $('modal-save-one')  .addEventListener('click', () => { ExportManager.saveOne(id); });
  $('modal-share-one') .addEventListener('click', () => { closeModal(); SocialManager.openModal(id); });
  $('modal-close')     .addEventListener('click', closeModal);

  // Before/After toggle — show if Enhance is on OR a film negative mode is selected
  const baBtn = $('modal-ba-toggle');
  const filmMode = DOM.filmTypeSelect()?.value || 'none';
  const hasEffect = DOM.autoEnhanceToggle()?.checked || filmMode !== 'none';
  if (hasEffect) {
    baBtn.style.display = '';
    let baActive = false;
    baBtn.addEventListener('click', async () => {
      baActive = !baActive;
      const box = state.boxes.find(b => b.id === id);
      if (!box) return;
      // Processed = with all current settings; Original = raw crop, no processing
      const processed = await renderBoxToCanvas(box);
      const original  = await renderBoxToCanvas(box, { enhance: false, filmType: 'none' });
      const img = $('modal-preview-img');
      if (baActive) {
        img.src = original.toDataURL();
        img.setAttribute('data-ba', 'original');
        baBtn.textContent = '← See Processed';
        baBtn.title = 'Showing raw scan — click for processed version';
      } else {
        img.src = processed.toDataURL();
        img.setAttribute('data-ba', 'processed');
        baBtn.textContent = '🔄 Before/After';
        baBtn.title = 'Showing processed — click for raw scan';
      }
    });
  }

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
    const yearRaw = $('photo-year-input')?.value?.trim();
    return {
      format:    DOM.formatSelect().value,
      quality:   parseFloat(DOM.qualitySlider().value) / 100,
      baseName:  DOM.filenameInput().value.trim() || 'photo_',
      photoYear: yearRaw ? parseInt(yearRaw, 10) : null,
    };
  },

  canvasToBlob(canvas, format, quality) {
    return new Promise(resolve => {
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(blob => {
        if (format === 'jpeg' || format === 'jpg') {
          const { photoYear } = ExportManager.getSettings();
          if (photoYear) {
            ExportManager.injectExifYear(blob, photoYear).then(resolve);
            return;
          }
        }
        resolve(blob);
      }, mime, quality);
    });
  },

  /*
   * Pure-JS minimal EXIF writer: injects DateTimeOriginal into a JPEG blob.
   * Works by prepending a crafted APP1/EXIF segment between the SOI and
   * existing APP0/APP1 markers. No external library required.
   */
  async injectExifYear(blob, year) {
    try {
      const dt = `${year}:01:01 00:00:00`; // EXIF datetime format
      const dtBytes = [...dt].map(c => c.charCodeAt(0));
      // EXIF IFD0 with DateTimeOriginal (tag 0x9003)
      // Header: 'Exif\0\0' + TIFF header (little-endian)
      const exifMarker = [
        0xFF, 0xE1,    // APP1 marker
        0x00, 0x00,    // length placeholder (2 bytes)
        0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // 'Exif\0\0'
        // TIFF: little-endian 'II', magic 42, offset to IFD0 = 8
        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
        // IFD0: 1 entry
        0x01, 0x00, // count = 1
        // DateTimeOriginal tag: 0x9003, type=2(ASCII), count=20, offset from TIFF start
        0x03, 0x90, // tag 0x9003
        0x02, 0x00, // type ASCII
        0x14, 0x00, 0x00, 0x00, // count = 20
        0x1A, 0x00, 0x00, 0x00, // offset = 26 from TIFF start (8+2+12+4)
        // Next IFD offset = 0
        0x00, 0x00, 0x00, 0x00,
        // DateTime string (20 bytes incl null)
        ...dtBytes, 0x00,
      ];
      // Fix APP1 length (length field = segment length including the 2-byte length field itself)
      const app1Len = exifMarker.length - 2; // subtract the 0xFF 0xE1 marker bytes
      exifMarker[2] = (app1Len >> 8) & 0xFF;
      exifMarker[3] = app1Len & 0xFF;

      // Read original JPEG
      const origBuf = await blob.arrayBuffer();
      const orig = new Uint8Array(origBuf);
      // Find insertion point: after SOI (bytes 0,1 = FF D8)
      // Insert our APP1 right after SOI
      const exifArr = new Uint8Array(exifMarker);
      const out = new Uint8Array(2 + exifArr.length + (orig.length - 2));
      out.set(orig.subarray(0, 2), 0);          // SOI
      out.set(exifArr, 2);                       // our APP1
      out.set(orig.subarray(2), 2 + exifArr.length); // rest of JPEG
      return new Blob([out], { type: 'image/jpeg' });
    } catch {
      return blob; // fallback: return original if EXIF injection fails
    }
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
    const canvas = await renderBoxToCanvas(box, { enhance: DOM.autoEnhanceToggle()?.checked });
    const blob = await this.canvasToBlob(canvas, format, quality);
    const fName = this.getFilename(idx, baseName, format);
    this.triggerDownload(blob, fName);
    
    // Export sidecars
    const baseWithoutExt = fName.substring(0, fName.lastIndexOf('.'));
    this._exportSidecars(box, baseWithoutExt, false, null);
    
    showToast(`Saved: ${fName}`, 'success');
  },

  _exportSidecars(box, baseWithoutExt, isZip, zipObj) {
    if (box.audioNote) {
      if (isZip) {
        zipObj.file(`${baseWithoutExt}_audio.webm`, box.audioNote);
      } else {
        setTimeout(() => this.triggerDownload(box.audioNote, `${baseWithoutExt}_audio.webm`), 200);
      }
    }
    if (box.meta && (box.meta.caption || box.meta.people || box.meta.location || box.meta.notes || box.meta.date)) {
      let text = ``;
      if (box.meta.date) text += `Date: ${box.meta.date}\n`;
      if (box.meta.location) text += `Location: ${box.meta.location}\n`;
      if (box.meta.people) text += `People: ${box.meta.people}\n`;
      if (box.meta.caption) text += `\nCaption: ${box.meta.caption}\n`;
      if (box.meta.notes) text += `\nNotes: ${box.meta.notes}\n`;
      text = text.trim();
      
      if (isZip) {
        zipObj.file(`${baseWithoutExt}_meta.txt`, text);
      } else {
        let textBlob = new Blob([text], { type: 'text/plain' });
        setTimeout(() => this.triggerDownload(textBlob, `${baseWithoutExt}_meta.txt`), 400);
      }
    }
    
    if (box.backImage) {
      fetch(box.backImage).then(res => res.blob()).then(blob => {
        if (isZip) {
          zipObj.file(`${baseWithoutExt}_back.jpg`, blob);
        } else {
          setTimeout(() => this.triggerDownload(blob, `${baseWithoutExt}_back.jpg`), 600);
        }
      });
    }
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
      const canvas = await renderBoxToCanvas(box, { enhance: DOM.autoEnhanceToggle()?.checked });
      const blob = await this.canvasToBlob(canvas, format, quality);
      const fName = this.getFilename(idx, baseName, format);
      this.triggerDownload(blob, fName);
      
      const baseWithoutExt = fName.substring(0, fName.lastIndexOf('.'));
      this._exportSidecars(box, baseWithoutExt, false, null);
      
      saved++;
      setProgress(Math.round(saved / state.boxes.length * 100), `Saving ${saved} of ${state.boxes.length}…`);
      // Delay longer to allow sidecar downloads to pass browser limits
      await new Promise(r => setTimeout(r, 150 + (box.audioNote ? 100 : 0)));
    }

    hideSpinner();
    if (typeof gtag !== 'undefined') gtag('event', 'images_downloaded', { count: saved, type: 'individual' });
    showToast(`✅ Saved ${saved} photo${saved !== 1 ? 's' : ''}!`, 'success', 4000);

    // Viral nudge — shown once per session after a successful Save All
    if (!sessionStorage.getItem('share_nudge_shown')) {
      sessionStorage.setItem('share_nudge_shown', '1');
      setTimeout(() => {
        const t = document.createElement('div');
        t.className = 'toast toast-info';
        t.style.cssText = 'max-width:320px;cursor:pointer';
        t.innerHTML = `<span>❤️</span><span>Found this useful? <strong><a href="#share-tool-bar" style="color:inherit">Share PhotoSplit Studio</a></strong> with someone who'd love it!</span>`;
        t.addEventListener('click', () => {
          document.getElementById('share-tool-bar')?.scrollIntoView({ behavior: 'smooth' });
          t.remove();
        });
        document.getElementById('toast-container')?.appendChild(t);
        setTimeout(() => { t.classList.add('removing'); t.addEventListener('animationend', () => t.remove()); }, 8000);
      }, 1500);
    }
  },
};

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  ZIP MANAGER                                                               *
 * ═══════════════════════════════════════════════════════════════════════════ */

const ZipManager = {
  async saveAllAsZip(boxes, prefix = 'photo_', customFormat = null) {
    if (!boxes || boxes.length === 0) {
      showToast('No splits to save. Run detection or draw crop regions first.', 'warning');
      return;
    }
    if (typeof JSZip === 'undefined') {
      showToast('JSZip library not loaded. Check your internet connection.', 'error');
      return;
    }

    const { format, quality, baseName } = ExportManager.getSettings();
    const usedFormat  = customFormat || format;
    const usedBaseName = prefix !== 'photo_' ? prefix : baseName;
    const mime = usedFormat === 'png' ? 'image/png' : 'image/jpeg';
    const ext  = usedFormat === 'png' ? 'png' : 'jpg';

    showSpinner(`Building ZIP for ${boxes.length} photos…`);
    setProgress(0, 'Compressing…');

    const zip = new JSZip();
    let done = 0;

    for (const [idx, box] of boxes.entries()) {
      const canvas = await renderBoxToCanvas(box, { enhance: DOM.autoEnhanceToggle()?.checked });
      const blob   = await ExportManager.canvasToBlob(canvas, usedFormat, quality);
      const num    = String(idx + 1).padStart(2, '0');
      zip.file(`${usedBaseName}${num}.${ext}`, blob);
      
      ExportManager._exportSidecars(box, `${usedBaseName}${num}`, true, zip);
      
      done++;
      setProgress(Math.round(done / boxes.length * 80), `Compressing ${done} of ${boxes.length}…`);
    }

    setProgress(90, 'Generating archive…');
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    setProgress(100, 'Done!');
    ExportManager.triggerDownload(zipBlob, `${usedBaseName}photos.zip`);
    hideSpinner();
    if (typeof gtag !== 'undefined') gtag('event', 'zip_downloaded', { count: boxes.length });
    showToast(`✅ ZIP ready — ${boxes.length} photo${boxes.length !== 1 ? 's' : ''} archived!`, 'success', 4000);
  },
};

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  SOCIAL MANAGER                                                            *
 *    Platform presets, resize/letterbox, watermark, clipboard, share API     *
 * ═══════════════════════════════════════════════════════════════════════════ */

const PLATFORM_PRESETS = [
  { key: 'ig-square',    name: 'Instagram\nSquare',   icon: '🟣', w: 1080, h: 1080 },
  { key: 'ig-portrait',  name: 'Instagram\nPortrait', icon: '🟣', w: 1080, h: 1350 },
  { key: 'ig-landscape', name: 'Instagram\nLandscape',icon: '🟣', w: 1080, h: 566  },
  { key: 'ig-story',     name: 'Story /\nTikTok',     icon: '🎵', w: 1080, h: 1920 },
  { key: 'twitter',      name: 'Twitter /\nX Card',   icon: '𝕏',  w: 1200, h: 675  },
  { key: 'facebook',     name: 'Facebook\nPost',       icon: '📘', w: 1200, h: 630  },
  { key: 'pinterest',    name: 'Pinterest\nPin',        icon: '📌', w: 1000, h: 1500 },
  { key: 'linkedin',     name: 'LinkedIn\nPost',        icon: '💼', w: 1200, h: 627  },
  { key: 'whatsapp',     name: 'WhatsApp\n(Optimised)', icon: '💬', w: 0,    h: 0    },
  { key: 'original',     name: 'Original\nSize',        icon: '🗇', w: 0,    h: 0    },
];

const SocialManager = {
  _activeBoxId: null,
  _activePlatform: PLATFORM_PRESETS[0],

  /* ── Open the social export modal for a given box id ──────────────── */
  openModal(boxId, presetKey = null) {
    const box = boxId ? state.boxes.find(b => b.id === boxId) : (state.selectedBoxId ? state.boxes.find(b => b.id === state.selectedBoxId) : (state.boxes.length ? state.boxes[0] : null));
    if (!box) { showToast('No photo detected yet.', 'warning'); return; }
    this._activeBoxId = box.id;
    this._activePlatform = presetKey ? (PLATFORM_PRESETS.find(p => p.key === presetKey) || PLATFORM_PRESETS[0]) : PLATFORM_PRESETS[0];

    // Build platform grid
    this._renderPlatformGrid();

    // Show native share button on capable browsers
    const shareBtn = $('social-btn-share');
    if (shareBtn) shareBtn.style.display = navigator.share ? 'inline-flex' : 'none';

    // Bind live-update listeners
    $('social-bg-color').addEventListener('input', () => this._refreshPreview());
    $('social-watermark-text').addEventListener('input', () => this._refreshPreview());
    $('social-watermark-pos').addEventListener('change', () => this._refreshPreview());

    // Open modal
    $('social-modal-backdrop').classList.add('open');
    this._refreshPreview();
  },

  closeModal() {
    $('social-modal-backdrop').classList.remove('open');
    this._activeBoxId = null;
  },

  _renderPlatformGrid() {
    const grid = $('platform-grid');
    if (!grid) return;
    grid.innerHTML = '';
    PLATFORM_PRESETS.forEach(preset => {
      const btn = document.createElement('button');
      btn.className = 'platform-btn' + (preset.key === this._activePlatform.key ? ' active' : '');
      const dims = preset.w && preset.h ? `${preset.w}×${preset.h}` : 'Original';
      btn.innerHTML = `
        <span class="platform-btn-icon">${preset.icon}</span>
        <span class="platform-btn-name">${preset.name.replace('\n','<br>')}</span>
        <span class="platform-btn-dims">${dims}</span>`;
      btn.addEventListener('click', () => {
        this._activePlatform = preset;
        grid.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._refreshPreview();
      });
      grid.appendChild(btn);
    });
  },

  /* ── Build the composited canvas (resize + letterbox + watermark) ────── */
  async _buildCanvas() {
    const box = state.boxes.find(b => b.id === this._activeBoxId);
    if (!box) return null;

    const srcCanvas = await renderBoxToCanvas(box, { enhance: DOM.autoEnhanceToggle()?.checked });
    const preset    = this._activePlatform;
    const bgColor   = $('social-bg-color')?.value   || '#ffffff';
    const wmText    = $('social-watermark-text')?.value.trim() || '';
    const wmPos     = $('social-watermark-pos')?.value  || 'bottom-center';

    return this._compose(srcCanvas, preset, bgColor, wmText, wmPos);
  },

  /* ── Compose: contain-scale src into target, letterbox, add watermark ─ */
  _compose(srcCanvas, preset, bgColor, wmText, wmPos) {
    const sw = srcCanvas.width;
    const sh = srcCanvas.height;

    let tw, th;
    if (!preset.w || !preset.h) {
      // Original / WhatsApp — cap at 2000px longest side
      const maxSide = preset.key === 'whatsapp' ? 2000 : Math.max(sw, sh);
      const scaleDown = Math.min(1, maxSide / Math.max(sw, sh));
      tw = Math.round(sw * scaleDown);
      th = Math.round(sh * scaleDown);
    } else {
      tw = preset.w;
      th = preset.h;
    }

    const dst  = document.createElement('canvas');
    dst.width  = tw;
    dst.height = th;
    const dctx = dst.getContext('2d');

    // Fill background
    dctx.fillStyle = bgColor;
    dctx.fillRect(0, 0, tw, th);

    // Contain-scale source
    const scale = Math.min(tw / sw, th / sh);
    const dw    = Math.round(sw * scale);
    const dh    = Math.round(sh * scale);
    const dx    = Math.round((tw - dw) / 2);
    const dy    = Math.round((th - dh) / 2);
    dctx.drawImage(srcCanvas, 0, 0, sw, sh, dx, dy, dw, dh);

    // Watermark
    if (wmText) {
      this._drawWatermark(dctx, tw, th, wmText, wmPos);
    }

    return dst;
  },

  _drawWatermark(ctx, W, H, text, position) {
    const size   = Math.max(14, Math.round(Math.min(W, H) * 0.028));
    ctx.font     = `700 ${size}px Inter, sans-serif`;
    const metrics = ctx.measureText(text);
    const tw     = metrics.width;
    const padH   = size * 0.5;
    const padV   = size * 0.35;
    const boxW   = tw + padH * 2;
    const boxH   = size + padV * 2;
    const margin = Math.round(Math.min(W, H) * 0.025);

    let bx, by;
    switch (position) {
      case 'bottom-right':  bx = W - boxW - margin; by = H - boxH - margin; break;
      case 'bottom-left':   bx = margin;            by = H - boxH - margin; break;
      case 'top-center':    bx = (W - boxW) / 2;   by = margin;            break;
      default: /* bottom-center */
        bx = (W - boxW) / 2; by = H - boxH - margin;
    }

    // Pill background
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    const r = boxH / 2;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.arcTo(bx + boxW, by, bx + boxW, by + boxH, r);
    ctx.arcTo(bx + boxW, by + boxH, bx, by + boxH, r);
    ctx.arcTo(bx, by + boxH, bx, by, r);
    ctx.arcTo(bx, by, bx + boxW, by, r);
    ctx.closePath();
    ctx.fill();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font      = `700 ${size}px Inter, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + padH, by + boxH / 2);
    ctx.restore();
  },

  /* ── Refresh live preview canvas ──────────────────────────────── */
  async _refreshPreview() {
    const composed = await this._buildCanvas();
    if (!composed) return;

    const previewEl = $('social-preview-canvas');
    const badge     = $('social-dim-badge');
    if (!previewEl) return;

    // Scale down to fit the preview pane (max 380×260 display)
    const maxW = 380, maxH = 240;
    const scale = Math.min(1, maxW / composed.width, maxH / composed.height);
    previewEl.width  = Math.round(composed.width  * scale);
    previewEl.height = Math.round(composed.height * scale);
    const pctx = previewEl.getContext('2d');
    pctx.drawImage(composed, 0, 0, previewEl.width, previewEl.height);

    if (badge) badge.textContent = `${composed.width}×${composed.height} px`;
  },

  /* ── Copy composited image to system clipboard ───────────────── */
  async copyPreviewToClipboard() {
    const composed = this._buildCanvas();
    if (!composed) return;
    try {
      const blob = await ExportManager.canvasToBlob(composed, 'png', 1);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      showToast('📋 Image copied to clipboard!', 'success');
    } catch (err) {
      showToast('Could not copy to clipboard: ' + err.message, 'error');
    }
  },

  /* ── Download for currently selected platform ───────────────── */
  async downloadForPlatform() {
    const composed = this._buildCanvas();
    if (!composed) return;
    const { format, quality, baseName } = ExportManager.getSettings();
    const box = state.boxes.find(b => b.id === this._activeBoxId);
    const idx = box ? state.boxes.indexOf(box) : 0;
    const preset  = this._activePlatform;
    const ext     = format === 'png' ? 'png' : 'jpg';
    const fname   = `${baseName}${String(idx+1).padStart(2,'0')}_${preset.key}.${ext}`;
    const blob    = await ExportManager.canvasToBlob(composed, format, quality);
    ExportManager.triggerDownload(blob, fname);
    showToast(`✅ Downloaded for ${preset.key}!`, 'success');
  },

  /* ── Native Web Share API (mobile) ────────────────────────── */
  async nativeShare() {
    const composed = this._buildCanvas();
    if (!composed) return;
    const blob = await ExportManager.canvasToBlob(composed, 'png', 1);
    const file = new File([blob], 'photo.png', { type: 'image/png' });
    try {
      await navigator.share({
        title: 'PhotoSplit Studio',
        text: 'Shared via PhotoSplit Studio — free photo scanner splitter',
        files: [file],
      });
    } catch (err) {
      if (err.name !== 'AbortError') showToast('Share failed: ' + err.message, 'error');
    }
  },

  /* ── Copy tool URL to clipboard ───────────────────────────── */
  async copyToolUrl() {
    const url = 'https://photosplitstudio.com';
    try {
      await navigator.clipboard.writeText(url);
      showToast('🔗 Link copied! Share it with friends.', 'success');
    } catch {
      showToast('Could not copy — please copy manually: ' + url, 'info', 6000);
    }
  },
};

/* ═══════════════════════════════════════════════════════════════════════════ *
 *  CAROUSEL SPLITTER                                                         *
 *    Divides the active scan image into an N×M grid of tiles                 *
 * ═══════════════════════════════════════════════════════════════════════════ */

const CarouselSplitter = {
  openModal() {
    if (state.activeFileIdx < 0) {
      showToast('Upload a scan first.', 'warning'); return;
    }
    $('carousel-modal-backdrop').classList.add('open');
    this._drawGridPreview();

    // Wire preset buttons
    document.querySelectorAll('.grid-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.grid-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $('carousel-cols').value = btn.dataset.cols;
        $('carousel-rows').value = btn.dataset.rows;
        this._drawGridPreview();
      });
    });

    // Wire custom inputs
    ['carousel-cols','carousel-rows'].forEach(id => {
      $(id).addEventListener('input', () => {
        document.querySelectorAll('.grid-preset-btn').forEach(b => b.classList.remove('active'));
        this._drawGridPreview();
      });
    });
  },

  closeModal() {
    $('carousel-modal-backdrop').classList.remove('open');
  },

  _getCols() { return Math.max(1, Math.min(10, parseInt($('carousel-cols').value, 10) || 3)); },
  _getRows() { return Math.max(1, Math.min(10, parseInt($('carousel-rows').value, 10) || 1)); },

    // Label
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${cols}×${rows} = ${cols * rows} tiles`, 6, 9);
  },

  async _drawGridPreview() {
    const cols  = this._getCols();
    const rows  = this._getRows();
    const canvas = $('grid-preview-canvas');
    if (!canvas) return;
    const W = 240, H = Math.round(W * (rows / cols)) || 60;
    canvas.width  = W;
    canvas.height = Math.max(H, 40);
    const ctx = canvas.getContext('2d');
    const cw = W / cols, rh = canvas.height / rows;

    const srcEl = DOM.mainCanvas();
    if (srcEl && srcEl.width) {
      ctx.drawImage(srcEl, 0, 0, W, canvas.height);
    } else {
      ctx.fillStyle = 'var(--bg-surface-2, #f7f8fc)';
      ctx.fillRect(0, 0, W, canvas.height);
    }

    ctx.strokeStyle = 'rgba(99,102,241,0.9)';
    ctx.lineWidth = 2;
    for (let c = 1; c < cols; c++) {
      ctx.beginPath(); ctx.moveTo(Math.round(c * cw), 0); ctx.lineTo(Math.round(c * cw), canvas.height); ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, Math.round(r * rh)); ctx.lineTo(W, Math.round(r * rh)); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${cols}×${rows} = ${cols * rows} tiles`, 6, 9);
  },


  _splitTiles(cols, rows) {
    const srcCanvas = DOM.mainCanvas();
    if (!srcCanvas || !srcCanvas.width) return [];
    const W   = srcCanvas.width;
    const H   = srcCanvas.height;
    const tw  = Math.floor(W / cols);
    const th  = Math.floor(H / rows);
    const tiles = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = document.createElement('canvas');
        tile.width  = tw;
        tile.height = th;
        tile.getContext('2d').drawImage(srcCanvas, c * tw, r * th, tw, th, 0, 0, tw, th);
        tiles.push({ canvas: tile, col: c + 1, row: r + 1, idx: r * cols + c });
      }
    }
    return tiles;
  },

  async splitAndDownload() {
    const cols  = this._getCols();
    const rows  = this._getRows();
    const tiles = this._splitTiles(cols, rows);
    if (!tiles.length) { showToast('No image loaded.', 'warning'); return; }
    const { format, quality, baseName } = ExportManager.getSettings();
    const ext = format === 'png' ? 'png' : 'jpg';
    showSpinner(`Exporting ${tiles.length} tiles…`);
    for (const tile of tiles) {
      const blob = await ExportManager.canvasToBlob(tile.canvas, format, quality);
      const num  = String(tile.idx + 1).padStart(2, '0');
      ExportManager.triggerDownload(blob, `${baseName}tile_${num}.${ext}`);
      await new Promise(r => setTimeout(r, 80));
    }
    hideSpinner();
    showToast(`✅ ${tiles.length} carousel tiles downloaded!`, 'success', 4000);
    this.closeModal();
  },

  async splitAndZip() {
    const cols  = this._getCols();
    const rows  = this._getRows();
    const tiles = this._splitTiles(cols, rows);
    if (!tiles.length) { showToast('No image loaded.', 'warning'); return; }
    if (typeof JSZip === 'undefined') { showToast('JSZip not loaded.', 'error'); return; }

    const { format, quality, baseName } = ExportManager.getSettings();
    const ext = format === 'png' ? 'png' : 'jpg';
    showSpinner(`Zipping ${tiles.length} tiles…`);
    const zip = new JSZip();
    for (const tile of tiles) {
      const blob = await ExportManager.canvasToBlob(tile.canvas, format, quality);
      const num  = String(tile.idx + 1).padStart(2, '0');
      zip.file(`${baseName}tile_${num}.${ext}`, blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    ExportManager.triggerDownload(zipBlob, `${baseName}carousel_${cols}x${rows}.zip`);
    hideSpinner();
    showToast(`✅ Carousel ZIP ready — ${tiles.length} tiles!`, 'success', 4000);
    this.closeModal();
  },
};

function initNegativeTools() {
  const select = DOM.filmTypeSelect();
  const proTools = DOM.negativeProTools();
  const pickBtn = DOM.btnPickFilmBase();

  const updateVisibility = () => {
    const isNegative = select.value === 'color' || select.value === 'bw';
    proTools.style.display = isNegative ? 'flex' : 'none';
  };

  select.addEventListener('change', () => {
    updateVisibility();
    state.pickingFilmBase = false;
    pickBtn.classList.remove('btn-primary');
    pickBtn.classList.add('btn-secondary');
    
    if (state.activeFileIdx >= 0) {
      renderStrip();
      if (state.selectedBoxId) previewBox(state.selectedBoxId);
    }
  });

  pickBtn.addEventListener('click', () => {
    state.pickingFilmBase = !state.pickingFilmBase;
    pickBtn.classList.toggle('btn-primary', state.pickingFilmBase);
    pickBtn.classList.toggle('btn-secondary', !state.pickingFilmBase);
    
    if (state.pickingFilmBase) {
      showToast('Click on the orange/unexposed border of the film to calibrate.', 'info', 4000);
      DOM.mainCanvas().style.cursor = 'crosshair';
    } else {
      DOM.mainCanvas().style.cursor = '';
    }
  });

  DOM.negativeClaheToggle().addEventListener('change', () => {
    if (state.activeFileIdx >= 0) {
      renderStrip();
      if (state.selectedBoxId) previewBox(state.selectedBoxId);
    }
  });

  // ── PHASE 1 ENHANCEMENTS EVENT LISTENERS ──
  DOM.sharpenToggle()?.addEventListener('change', (e) => {
    DOM.sharpenAmountRow().style.display = e.target.checked ? 'block' : 'none';
    if (state.activeFileIdx >= 0) {
      renderStrip();
      if (state.selectedBoxId) previewBox(state.selectedBoxId);
    }
  });
  DOM.sharpenAmountSlider()?.addEventListener('input', () => {
    if (DOM.sharpenToggle()?.checked) {
      clearTimeout(window._sharpenTimer);
      window._sharpenTimer = setTimeout(() => {
        if (state.activeFileIdx >= 0) {
          renderStrip();
          if (state.selectedBoxId) previewBox(state.selectedBoxId);
        }
      }, 200);
    }
  });
  DOM.colorizeBwToggle()?.addEventListener('change', () => {
    if (state.activeFileIdx >= 0) {
      renderStrip();
      if (state.selectedBoxId) previewBox(state.selectedBoxId);
    }
  });
  DOM.colorFilterSelect()?.addEventListener('change', () => {
    if (state.activeFileIdx >= 0) {
      renderStrip();
      if (state.selectedBoxId) previewBox(state.selectedBoxId);
    }
  });

  /* ═══════════════════════════════════════════════════════════════════════════
   *  PHASE 2: AUDIO NOTE & METADATA MANAGERS
   * ═══════════════════════════════════════════════════════════════════════════ */
  window.openMetadataModal = function(boxId) {
    const box = state.boxes.find(b => b.id === boxId);
    if (!box) return;
    
    // Ensure meta object exists
    box.meta = box.meta || { date: '', location: '', people: '', caption: '', notes: '' };
    
    $('meta-box-id').value = boxId;
    $('meta-date').value = box.meta.date || '';
    $('meta-location').value = box.meta.location || '';
    $('meta-people').value = box.meta.people || '';
    $('meta-caption').value = box.meta.caption || '';
    $('meta-notes').value = box.meta.notes || '';
    
    AudioNoteManager.loadForBox(box);
    AttachBackManager.refreshPreview(box);
    
    $('metadata-modal').style.display = 'flex';
    requestAnimationFrame(() => $('metadata-modal').setAttribute('aria-hidden', 'false'));
  };

  window.closeMetadataModal = function() {
    AudioNoteManager.stopRecording();
    $('metadata-modal').setAttribute('aria-hidden', 'true');
    setTimeout(() => { $('metadata-modal').style.display = 'none'; }, 300);
  };

  window.saveMetadataModal = function() {
    const boxId = parseInt($('meta-box-id').value, 10);
    const box = state.boxes.find(b => b.id === boxId);
    if (box) {
      box.meta = box.meta || {};
      box.meta.date = $('meta-date').value;
      box.meta.location = $('meta-location').value;
      box.meta.people = $('meta-people').value;
      box.meta.caption = $('meta-caption').value;
      box.meta.notes = $('meta-notes').value;
      pushUndo();
      showToast('Photo details saved!', 'success');
    }
    closeMetadataModal();
  };

  const OCRManager = {
    isLoaded: false,
    async init() {
      if (this.isLoaded) return;
      showSpinner('Loading OCR Engine (Tesseract.js)...');
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
        script.onload = () => { this.isLoaded = true; hideSpinner(); resolve(); };
        script.onerror = () => { hideSpinner(); showToast('Failed to load OCR.', 'error'); reject(); };
        document.head.appendChild(script);
      });
    },
    async extractText(boxId) {
      const box = state.boxes.find(b => b.id === boxId);
      if (!box) return;
      await this.init();
      
      showSpinner('Extracting text...');
      try {
        const canvas = await renderBoxToCanvas(box, { enhance: true });
        const imgData = canvas.toDataURL('image/jpeg');
        const { data: { text } } = await Tesseract.recognize(imgData, 'eng');
        
        hideSpinner();
        if (text.trim()) {
          box.meta = box.meta || {};
          box.meta.notes = (box.meta.notes ? box.meta.notes + '\n\n' : '') + text.trim();
          showToast('Text extracted and added to Notes!', 'success');
          if ($('metadata-modal') && $('metadata-modal').getAttribute('aria-hidden') === 'false') {
            $('meta-notes').value = box.meta.notes;
          } else {
            openMetadataModal(boxId);
          }
        } else {
          showToast('No text detected in this photo.', 'info');
        }
      } catch (err) {
        hideSpinner();
        showToast('OCR Failed: ' + err.message, 'error');
      }
    }
  };

  const AttachBackManager = {
    handleUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const boxId = parseInt($('meta-box-id').value, 10);
      const box = state.boxes.find(b => b.id === boxId);
      if (!box) return;
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        box.backImage = ev.target.result;
        this.refreshPreview(box);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    
    remove() {
      const boxId = parseInt($('meta-box-id').value, 10);
      const box = state.boxes.find(b => b.id === boxId);
      if (box) {
        box.backImage = null;
        this.refreshPreview(box);
      }
    },
    
    refreshPreview(box) {
      if (box.backImage) {
        $('attach-back-preview').src = box.backImage;
        $('attach-back-preview').style.display = 'block';
        $('btn-remove-back').style.display = 'block';
      } else {
        $('attach-back-preview').src = '';
        $('attach-back-preview').style.display = 'none';
        $('btn-remove-back').style.display = 'none';
      }
    }
  };

  window.OCRManager = OCRManager;
  window.AttachBackManager = AttachBackManager;

  const AudioNoteManager = {
    mediaRecorder: null,
    audioChunks: [],
    currentBoxId: null,
    timerInt: null,
    startTime: 0,
    
    loadForBox(box) {
      this.currentBoxId = box.id;
      this.audioChunks = [];
      $('btn-record-audio').style.display = 'block';
      $('btn-stop-audio').style.display = 'none';
      $('audio-status').style.display = 'none';
      
      if (box.audioNote) {
        $('btn-record-audio').textContent = '🔴 Replace Audio';
        $('audio-playback-container').style.display = 'flex';
        $('audio-playback').src = URL.createObjectURL(box.audioNote);
      } else {
        $('btn-record-audio').textContent = '🔴 Record Audio';
        $('audio-playback-container').style.display = 'none';
        $('audio-playback').removeAttribute('src');
      }
    },
    
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        
        this.mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) this.audioChunks.push(e.data);
        };
        
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const box = state.boxes.find(b => b.id === this.currentBoxId);
          if (box) {
            box.audioNote = blob;
            this.loadForBox(box);
          }
          stream.getTracks().forEach(track => track.stop());
          clearInterval(this.timerInt);
          $('audio-status').style.display = 'none';
        };
        
        this.mediaRecorder.start();
        $('btn-record-audio').style.display = 'none';
        $('btn-stop-audio').style.display = 'block';
        $('audio-playback-container').style.display = 'none';
        $('audio-status').style.display = 'inline';
        this.startTime = Date.now();
        
        this.timerInt = setInterval(() => {
          const s = Math.floor((Date.now() - this.startTime) / 1000);
          $('audio-time').textContent = `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
        }, 1000);
      } catch (err) {
        showToast('Microphone access denied or unavailable.', 'error');
      }
    },
    
    stopRecording() {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    },
    
    deleteNote() {
      const box = state.boxes.find(b => b.id === this.currentBoxId);
      if (box && box.audioNote) {
        box.audioNote = null;
        this.loadForBox(box);
      }
    }
  };

  $('btn-record-audio')?.addEventListener('click', () => AudioNoteManager.startRecording());
  $('btn-stop-audio')?.addEventListener('click', () => AudioNoteManager.stopRecording());
  $('btn-delete-audio')?.addEventListener('click', () => AudioNoteManager.deleteNote());

  DOM.mainCanvas().addEventListener('click', e => {
    if (!state.pickingFilmBase) return;
    
    const color = sampleColorAt(e.clientX, e.clientY);
    state.filmBaseColor = color;
    state.pickingFilmBase = false;
    
    pickBtn.classList.remove('btn-primary');
    pickBtn.classList.add('btn-secondary');
    pickBtn.style.borderLeft = `4px solid rgb(${color.r}, ${color.g}, ${color.b})`;
    DOM.mainCanvas().style.cursor = '';
    
    showToast(`Calibrated! Base Color: R:${color.r} G:${color.g} B:${color.b}`, 'success');
    
    renderStrip();
    if (state.selectedBoxId) previewBox(state.selectedBoxId);
  });
  
  updateVisibility();
}


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

  // ZIP Button
  const btnZip = $('btn-save-zip');
  if (btnZip) btnZip.addEventListener('click', () => ZipManager.saveAllAsZip(state.boxes));

  const btnPdf = $('btn-save-pdf');
  if (btnPdf) btnPdf.addEventListener('click', () => saveAsPdf());

  // Global Social Share Button
  const btnGlobalShare = $('btn-global-share');
  if (btnGlobalShare) {
    btnGlobalShare.addEventListener('click', () => {
      if (state.boxes.length === 0) {
        showToast('No photos detected yet. Run detection first.', 'warning');
        return;
      }
      const targetId = state.selectedId || state.boxes[0].id;
      SocialManager.openModal(targetId);
    });
  }

  // Carousel Button
  const btnCarousel = $('btn-carousel-split');
  if (btnCarousel) btnCarousel.addEventListener('click', () => CarouselSplitter.openModal());

  // Collage Maker Button
  const btnCollage = $('btn-collage-maker');
  if (btnCollage) btnCollage.addEventListener('click', () => CollageManager.openModal());

  // Slideshow Button
  const btnSlideshow = $('btn-slideshow');
  if (btnSlideshow) btnSlideshow.addEventListener('click', () => SlideshowManager.start());

  // Detect All Button — runs detection on every loaded file sequentially
  const btnDetectAll = $('btn-detect-all');
  if (btnDetectAll) {
    btnDetectAll.addEventListener('click', async () => {
      if (state.files.length === 0) {
        showToast('Load some scans first.', 'warning'); return;
      }
      const total = state.files.length;
      showToast(`⚡ Running detection on ${total} scan${total !== 1 ? 's' : ''}…`, 'info', 3000);
      for (let i = 0; i < total; i++) {
        await activateFileAsync(i);
        await runDetectionAsync();
        setProgress(Math.round((i + 1) / total * 100), `Processed ${i + 1} of ${total}…`);
      }
      showToast(`✅ Detected photos in all ${total} scan${total !== 1 ? 's' : ''}!`, 'success', 4000);
    });
  }

  // Social + carousel modal close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      SocialManager.closeModal();
      CarouselSplitter.closeModal();
    }
  });

  // Format / quality
  DOM.formatSelect().addEventListener('change', () => {
    const isPng = DOM.formatSelect().value === 'png';
    $('quality-row').style.display = isPng ? 'none' : 'flex';
    if ($('quality-range-row')) {
      $('quality-range-row').style.display = isPng ? 'none' : 'block';
    }
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
  initNegativeTools();
  initClipboardPaste();
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

// app.js is loaded at the bottom of <body> without defer/async.
// By the time this script runs, DOMContentLoaded has already fired,
// so we must call init() directly if the DOM is already ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  CLIPBOARD PASTE — Ctrl+V to paste an image directly into the app         *
 * ══════════════════════════════════════════════════════════════════════════ */
function initClipboardPaste() {
  document.addEventListener('paste', async (e) => {
    // Don't intercept paste in form fields
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    const items = [...(e.clipboardData?.items || [])];
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (file) {
      showToast('📋 Pasting image from clipboard…', 'info', 2000);
      await handleFiles([file]);
    }
  });
}

/* ══════════════════════════════════════════════════════════════════════════ *
 *  COPY SINGLE PHOTO TO CLIPBOARD                                           *
 * ══════════════════════════════════════════════════════════════════════════ */
async function copyBoxToClipboard(id) {
  if (!navigator.clipboard || !window.ClipboardItem) {
    showToast('Clipboard API not supported in this browser.', 'warning'); return;
  }
  const box = state.boxes.find(b => b.id === id);
  if (!box) return;
  try {
    const canvas = await renderBoxToCanvas(box, {
      enhance: DOM.autoEnhanceToggle()?.checked,
      filmType: DOM.filmTypeSelect()?.value || 'none',
    });
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('✅ Photo copied to clipboard!', 'success', 2500);
      } catch (err) {
        showToast('Could not copy: ' + err.message, 'error');
      }
    }, 'image/png');
  } catch (err) {
    showToast('Render error: ' + err.message, 'error');
  }
}
window.copyBoxToClipboard = copyBoxToClipboard;

/* ══════════════════════════════════════════════════════════════════════════ *
 *  PDF EXPORT — jsPDF multi-page, one photo per page                        *
 * ══════════════════════════════════════════════════════════════════════════ */
async function saveAsPdf() {
  if (!window.jspdf) { showToast('PDF library not loaded yet, try again.', 'warning'); return; }
  if (state.boxes.length === 0) { showToast('No photos to export.', 'warning'); return; }

  showSpinner('Building PDF…');
  const { jsPDF } = window.jspdf;

  try {
    let doc = null;
    const doEnhance = DOM.autoEnhanceToggle()?.checked;
    const filmType = DOM.filmTypeSelect()?.value || 'none';

    for (let i = 0; i < state.boxes.length; i++) {
      const box = state.boxes[i];
      setProgress(Math.round(i / state.boxes.length * 90), `Rendering photo ${i + 1} of ${state.boxes.length}…`);

      const canvas = await renderBoxToCanvas(box, { enhance: doEnhance, filmType });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      const W = canvas.width;
      const H = canvas.height;
      const orientation = W >= H ? 'landscape' : 'portrait';

      if (!doc) {
        doc = new jsPDF({ orientation, unit: 'px', format: [W, H], compress: true });
      } else {
        doc.addPage([W, H], orientation);
      }
      doc.addImage(imgData, 'JPEG', 0, 0, W, H);
    }

    setProgress(100, 'Saving…');
    const ts = new Date().toISOString().slice(0, 10);
    doc.save(`photosplit_${ts}.pdf`);
    showToast(`✅ PDF saved — ${state.boxes.length} photo${state.boxes.length !== 1 ? 's' : ''}`, 'success', 3000);
  } catch (err) {
    showToast('PDF error: ' + err.message, 'error');
  } finally {
    hideSpinner();
  }
}
window.saveAsPdf = saveAsPdf;

/* ══════════════════════════════════════════════════════════════════════════ *
 *  GLOBAL EXPORTS — accessible from HTML onclick attributes                  *
 * ══════════════════════════════════════════════════════════════════════════ */
window.ExportManager    = ExportManager;
window.ZipManager       = ZipManager;
window.SocialManager    = SocialManager;
window.CarouselSplitter = CarouselSplitter;
window.applyZoom        = applyZoom;
window.zoomIn           = zoomIn;
window.zoomOut          = zoomOut;
window.zoomFit          = zoomFit;
window.closeModal       = closeModal;
window.previewBox       = previewBox;
window.deleteBox        = deleteBox;
window.rotateBox        = rotateBox;
window.selectBox        = selectBox;

