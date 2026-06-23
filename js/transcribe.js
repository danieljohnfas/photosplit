/* ═══════════════════════════════════════════════════════════════════════════
   PhotoSplit Studio — transcribe.js
   Audio-to-Text Transcriber: Transformers.js (file) + Web Speech API (live)
   All audio is processed locally.
═══════════════════════════════════════════════════════════════════════════ */

"use strict";

/* ── Constants ────────────────────────────────────────────────────────────── */
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB local limit (since no upload)
const ACCEPTED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
const ACCEPTED_EXTS = [
  ".mp3",
  ".mp4",
  ".m4a",
  ".wav",
  ".ogg",
  ".webm",
  ".mov",
  ".flac",
];

/* ── Utility ──────────────────────────────────────────────────────────────── */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function now() {
  return new Date().toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Local Transcriber (Transformers.js Worker) ───────────────────────────── */
const LocalTranscriber = {
  worker: null,
  isReady: false,
  callbacks: {},

  init() {
    if (this.worker) return;
    this.worker = new Worker("/js/whisper-worker.js", { type: "module" });
    this.worker.onmessage = (event) => this.handleMessage(event.data);
  },

  handleMessage(data) {
    const { type } = data;
    if (this.callbacks[type]) {
      this.callbacks[type](data);
    }
  },

  on(type, callback) {
    this.callbacks[type] = callback;
  },

  loadModel(modelKey) {
    this.init();
    this.worker.postMessage({ type: "load", model: modelKey });
  },

  async transcribe(file, opts = {}) {
    this.init();
    const { language = "", timestamps = false } = opts;

    if (file.size > MAX_FILE_BYTES) {
      throw new Error(
        `File too large (${formatBytes(file.size)}). Limit is 50 MB.`,
      );
    }

    // Decode and resample to 16000Hz (required by Whisper)
    let audioData;
    try {
      this.callbacks["audio-decode-start"] &&
        this.callbacks["audio-decode-start"]();
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      audioData = audioBuffer.getChannelData(0); // Mono Float32Array
    } catch (e) {
      throw new Error(
        "Could not decode audio file. It may be corrupted or unsupported.",
      );
    }

    this.worker.postMessage({
      type: "transcribe",
      audio: audioData,
      language: language,
      timestamps: timestamps,
    });
  },

  cancel() {
    if (this.worker) {
      this.worker.postMessage({ type: "cancel" });
    }
  },
};

/* ── Live Transcriber (Web Speech API) ───────────────────────────────────── */
const LiveTranscriber = {
  recognition: null,
  isRunning: false,
  fullTranscript: "",

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  start(opts = {}, callbacks = {}) {
    const { onInterim, onFinal, onError, onEnd } = callbacks;
    const { language = "en-US" } = opts;

    if (!this.isSupported()) {
      onError &&
        onError(
          "Live transcription is not supported in this browser. Try Chrome or Edge.",
        );
      return;
    }
    if (this.isRunning) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = language;
    this.fullTranscript = "";
    this.isRunning = true;

    this.recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.fullTranscript += transcript + " ";
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      if (final && onFinal) onFinal(this.fullTranscript.trim(), final.trim());
      if (interim && onInterim) onInterim(interim);
    };

    this.recognition.onerror = (event) => {
      this.isRunning = false;
      const messages = {
        "no-speech":
          "No speech detected. Please speak closer to the microphone.",
        "audio-capture": "Microphone not found or not accessible.",
        "not-allowed":
          "Microphone permission was denied. Please allow microphone access.",
        network: "Network error during live transcription.",
      };
      onError &&
        onError(
          messages[event.error] || `Speech recognition error: ${event.error}`,
        );
    };

    this.recognition.onend = () => {
      this.isRunning = false;
      onEnd && onEnd(this.fullTranscript.trim());
    };

    this.recognition.start();
  },

  stop() {
    if (this.recognition && this.isRunning) {
      this.recognition.stop();
      this.isRunning = false;
    }
  },

  getTranscript() {
    return this.fullTranscript.trim();
  },
};

/* ── Output Formatters ───────────────────────────────────────────────────── */
const Formatters = {
  toMarkdown(transcript, meta = {}) {
    const { filename = "Recording", language = "", duration = "" } = meta;
    const wc = wordCount(transcript);
    const dateStr = now();
    const durationStr = duration
      ? `\n- **Duration:** ${formatDuration(duration)}`
      : "";
    const langStr =
      language && language !== "unknown"
        ? `\n- **Detected Language:** ${language}`
        : "";

    return `# Meeting Transcript\n\n## Metadata\n- **Source:** ${filename}\n- **Date Transcribed:** ${dateStr}\n- **Word Count:** ${wc.toLocaleString()} words${durationStr}${langStr}\n\n---\n\n## Transcript\n\n${transcript}\n\n---\n\n*Generated locally by [PhotoSplit Studio](https://photosplitstudio.com/transcribe)*\n`;
  },

  toMarkdownWithTimestamps(segments = [], meta = {}) {
    const { filename = "Recording", language = "" } = meta;
    const wc = wordCount(segments.map((s) => s.text).join(" "));
    const dateStr = now();
    const langStr =
      language && language !== "unknown"
        ? `\n- **Detected Language:** ${language}`
        : "";

    const body = segments
      .map(
        (seg) =>
          `**[${formatDuration(seg.timestamp[0])} → ${formatDuration(seg.timestamp[1])}]** ${seg.text.trim()}`,
      )
      .join("\n\n");

    return `# Meeting Transcript\n\n## Metadata\n- **Source:** ${filename}\n- **Date Transcribed:** ${dateStr}\n- **Word Count:** ${wc.toLocaleString()} words${langStr}\n\n---\n\n## Transcript (with Timestamps)\n\n${body}\n\n---\n\n*Generated locally by [PhotoSplit Studio](https://photosplitstudio.com/transcribe)*\n`;
  },

  download(content, filename, mimeType = "text/plain") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  },

  async copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  },

  async toDocx(transcript, meta = {}) {
    const { filename = "Recording", language = "" } = meta;
    const wc = wordCount(transcript);
    const dateStr = now();

    if (window.docx) {
      return this._toDocxWithLib(transcript, meta);
    }

    const langLine =
      language && language !== "unknown" ? `Language: ${language}\\line ` : "";
    const rtf = `{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0 Calibri;}}\n{\\colortbl;\\red254\\green44\\blue85;}\n\\f0\\fs28\\b Meeting Transcript\\b0\\line\n\\fs20\nDate: ${dateStr}\\line\nSource: ${filename}\\line\n${langLine}Word Count: ${wc}\\line\n\\line\n\\fs22\\b Transcript\\b0\\line\n\\fs20\\line\n${transcript.replace(/\n/g, "\\line\n")}\n\\line\n\\line\n\\fs18\\i Generated locally by PhotoSplit Studio\\i0\n}`;
    return { content: rtf, ext: "rtf", mime: "application/rtf" };
  },

  async _toDocxWithLib(transcript, meta = {}) {
    const { filename = "Recording" } = meta;
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;

    const paragraphs = [
      new Paragraph({
        text: "Meeting Transcript",
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Source: ${filename}`, bold: false, size: 20 }),
        ],
      }),
      new Paragraph({
        children: [new TextRun({ text: `Date: ${now()}`, size: 20 })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Word Count: ${wordCount(transcript).toLocaleString()}`,
            size: 20,
          }),
        ],
      }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "Transcript", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: "" }),
      ...transcript
        .split("\n")
        .map(
          (line) =>
            new Paragraph({
              children: [new TextRun({ text: line, size: 22 })],
            }),
        ),
      new Paragraph({ text: "" }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Generated locally by PhotoSplit Studio",
            italics: true,
            size: 18,
            color: "FE2C55",
          }),
        ],
      }),
    ];

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const buffer = await Packer.toBuffer(doc);
    return {
      content: buffer,
      ext: "docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  },
};

/* ── UI Controller ───────────────────────────────────────────────────────── */
const TranscribeUI = {
  state: "idle", // idle | ready | loading_model | transcribing | done | recording | error
  currentFile: null,
  currentResult: null,
  audioDuration: null,
  liveMode: false,
  modelReady: false,
  downloadedFiles: new Set(),

  init() {
    this.bindElements();
    this.bindEvents();
    this.setupWorker();
    this.updateUI();
  },

  setupWorker() {
    LocalTranscriber.init();
    LocalTranscriber.on("model-loading", (data) => {
      this.setState("loading_model");
      this.setProgress(0, `Loading ${data.model} model...`);
    });
    LocalTranscriber.on("model-progress", (data) => {
      this.setState("loading_model");
      if (!this.downloadedFiles.has(data.file)) {
        // Average progress across files vaguely
        this.setProgress(
          data.progress,
          `Downloading model files (${data.progress}%)...`,
        );
      }
    });
    LocalTranscriber.on("model-file-done", (data) => {
      this.downloadedFiles.add(data.file);
    });
    LocalTranscriber.on("model-ready", (data) => {
      this.modelReady = true;
      if (this.state === "loading_model" && this.currentFile) {
        this.startTranscription(); // auto resume if we were waiting
      }
    });
    LocalTranscriber.on("audio-decode-start", () => {
      this.setState("transcribing");
      this.setProgress(10, "Decoding audio file...");
    });
    LocalTranscriber.on("transcription-started", () => {
      this.setState("transcribing");
      this.setProgress(50, "Transcribing audio... (This may take a while)");
      this.outputWrap.style.display = "block";
    });
    LocalTranscriber.on("partial", (data) => {
      if (this.liveInterim) this.liveInterim.textContent = data.text;
    });
    LocalTranscriber.on("result", (data) => {
      this.currentResult = { text: data.text, segments: data.chunks };
      this.showOutput(data.text, "", data.chunks);
      this.setState("done");
      if (this.liveInterim) this.liveInterim.textContent = "";
    });
    LocalTranscriber.on("error", (data) => {
      this.showError(data.message);
      this.setState("ready");
    });
  },

  bindElements() {
    this.dropZone = document.getElementById("transcribe-drop");
    this.fileInput = document.getElementById("transcribe-file-input");
    this.fileInfo = document.getElementById("file-info");
    this.fileName = document.getElementById("file-name");
    this.fileSize = document.getElementById("file-size");
    this.fileDuration = document.getElementById("file-duration");
    this.fileDurationValue = document.getElementById("file-duration-value");
    this.btnRemoveFile = document.getElementById("btn-remove-file");

    this.languageSelect = document.getElementById("transcribe-language");
    this.timestampsToggle = document.getElementById("timestamps-toggle");
    this.modelSelect = document.getElementById("model-select");

    this.btnTranscribe = document.getElementById("btn-transcribe");
    this.btnRecord = document.getElementById("btn-record");
    this.progressWrap = document.getElementById("progress-wrap");
    this.progressBar = document.getElementById("transcribe-progress-bar");
    this.progressText = document.getElementById("transcribe-progress-text");

    this.outputWrap = document.getElementById("output-wrap");
    this.outputTextarea = document.getElementById("transcript-output");
    this.wordCountEl = document.getElementById("word-count");
    this.detectedLang = document.getElementById("detected-lang");

    this.btnCopy = document.getElementById("btn-copy");
    this.btnDownloadTxt = document.getElementById("btn-download-txt");
    this.btnDownloadMd = document.getElementById("btn-download-md");
    this.btnDownloadDocx = document.getElementById("btn-download-docx");
    this.btnPrint = document.getElementById("btn-print");
    this.btnClear = document.getElementById("btn-clear");

    this.errorBox = document.getElementById("transcribe-error");
    this.liveInterim = document.getElementById("live-interim");
  },

  bindEvents() {
    this.dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.dropZone.classList.add("drag-over");
    });
    this.dropZone.addEventListener("dragleave", () =>
      this.dropZone.classList.remove("drag-over"),
    );
    this.dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      this.dropZone.classList.remove("drag-over");
      if (e.dataTransfer.files[0]) this.loadFile(e.dataTransfer.files[0]);
    });
    this.dropZone.addEventListener("click", () => {
      if (!this.dropZone.querySelector(".file-loaded")) this.fileInput.click();
    });
    this.fileInput.addEventListener("change", () => {
      if (this.fileInput.files[0]) this.loadFile(this.fileInput.files[0]);
    });
    this.btnRemoveFile &&
      this.btnRemoveFile.addEventListener("click", (e) => {
        e.stopPropagation();
        this.clearFile();
      });

    this.btnTranscribe.addEventListener("click", () => {
      if (!this.modelReady) {
        LocalTranscriber.loadModel(this.modelSelect.value);
        this.setState("loading_model");
      } else {
        this.startTranscription();
      }
    });

    this.modelSelect.addEventListener("change", () => {
      this.modelReady = false; // Reset ready state to force reload if changed
    });

    this.btnRecord.addEventListener("click", () => this.toggleLive());

    this.btnCopy.addEventListener("click", () => this.doCopy());
    this.btnDownloadTxt.addEventListener("click", () => this.doDownloadTxt());
    this.btnDownloadMd.addEventListener("click", () => this.doDownloadMd());
    this.btnDownloadDocx.addEventListener("click", () => this.doDownloadDocx());
    this.btnPrint.addEventListener("click", () => this.doPrint());
    this.btnClear.addEventListener("click", () => this.doClear());

    this.outputTextarea.addEventListener("input", () =>
      this.updateWordCount(this.outputTextarea.value),
    );
  },

  loadFile(file) {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    const validExt = ACCEPTED_EXTS.includes(ext);
    const validType = ACCEPTED_TYPES.includes(file.type) || validExt;

    if (!validType) {
      this.showError(
        `Unsupported file type: ${file.type || ext}. Please use MP3, MP4, WAV, M4A, OGG, or WebM.`,
      );
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.showError(
        `File is too large (${formatBytes(file.size)}). Maximum size is 50 MB.`,
      );
      return;
    }

    this.currentFile = file;
    this.hideError();
    this.fileName.textContent = file.name;
    this.fileSize.textContent = formatBytes(file.size);
    this.fileInfo.style.display = "flex";

    this.audioDuration = null;
    const audio = new Audio();
    audio.preload = "metadata";
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.onloadedmetadata = () => {
      this.audioDuration = audio.duration;
      if (this.fileDuration) {
        if (this.fileDurationValue) this.fileDurationValue.textContent = formatDuration(audio.duration);
        this.fileDuration.style.display = "inline";
      }
      URL.revokeObjectURL(url);
    };

    this.setState("ready");
  },

  clearFile() {
    this.currentFile = null;
    this.audioDuration = null;
    this.fileInput.value = "";
    this.fileInfo.style.display = "none";
    if (this.fileDuration) this.fileDuration.style.display = "none";
    this.setState("idle");
  },

  async startTranscription() {
    if (!this.currentFile) {
      this.showError("Please select an audio file first.");
      return;
    }

    this.setState("transcribing");
    this.hideError();
    this.setProgress(5, "Preparing audio...");
    this.outputTextarea.value = "";

    try {
      await LocalTranscriber.transcribe(this.currentFile, {
        language: this.languageSelect.value || "",
        timestamps: this.timestampsToggle && this.timestampsToggle.checked,
      });
    } catch (err) {
      this.showError(err.message || "Transcription failed.");
      this.setState("ready");
    }
  },

  toggleLive() {
    if (LiveTranscriber.isRunning) {
      LiveTranscriber.stop();
      this.btnRecord.innerHTML = "🎙️ <span>Start Recording</span>";
      this.btnRecord.classList.remove("recording");
      this.setState(this.outputTextarea.value ? "done" : "idle");
      if (this.liveInterim) this.liveInterim.textContent = "";
    } else {
      if (!LiveTranscriber.isSupported()) {
        this.showError(
          "Live transcription requires Chrome or Edge. Use file upload instead.",
        );
        return;
      }
      this.setState("recording");
      this.hideError();
      this.outputTextarea.value = "";
      this.updateWordCount("");
      this.outputWrap.style.display = "block";
      if (this.liveInterim) this.liveInterim.textContent = "";

      this.btnRecord.innerHTML = "⏹️ <span>Stop Recording</span>";
      this.btnRecord.classList.add("recording");

      LiveTranscriber.start(
        { language: this.languageSelect.value || "en-US" },
        {
          onFinal: (full, _latest) => {
            this.outputTextarea.value = full;
            this.updateWordCount(full);
            this.outputTextarea.scrollTop = this.outputTextarea.scrollHeight;
          },
          onInterim: (interim) => {
            if (this.liveInterim) this.liveInterim.textContent = interim;
          },
          onError: (msg) => {
            this.showError(msg);
            this.btnRecord.innerHTML = "🎙️ <span>Start Recording</span>";
            this.btnRecord.classList.remove("recording");
            if (this.liveInterim) this.liveInterim.textContent = "";
            this.setState(this.outputTextarea.value ? "done" : "idle");
          },
          onEnd: (full) => {
            if (this.liveInterim) this.liveInterim.textContent = "";
            this.currentResult = { text: full };
            this.setState(full ? "done" : "idle");
          },
        },
      );
    }
  },

  showOutput(text, language = "", segments = null) {
    let display = text;
    if (segments && segments.length) {
      display = segments
        .map(
          (s) =>
            `[${formatDuration(s.timestamp[0])} → ${formatDuration(s.timestamp[1])}] ${s.text.trim()}`,
        )
        .join("\n\n");
    }

    this.outputTextarea.value = display;
    this.outputWrap.style.display = "block";
    this.updateWordCount(display);

    if (this.detectedLang && language && language !== "unknown") {
      this.detectedLang.textContent = `Detected language: ${language}`;
      this.detectedLang.style.display = "inline-block";
    } else if (this.detectedLang) {
      this.detectedLang.style.display = "none";
    }
  },

  updateWordCount(text) {
    const wc = wordCount(text);
    this.wordCountEl.textContent = `${wc.toLocaleString()} word${wc !== 1 ? "s" : ""}`;
  },

  setProgress(pct, label = "") {
    this.progressBar.style.width = pct + "%";
    this.progressText.textContent = label;
  },

  setState(newState) {
    this.state = newState;
    this.updateUI();
  },

  updateUI() {
    const s = this.state;
    this.dropZone.classList.toggle("has-file", s !== "idle");

    this.btnTranscribe.disabled =
      s !== "ready" && s !== "done" && s !== "error";
    if (s === "loading_model") {
      this.btnTranscribe.textContent = "Loading Model...";
    } else if (s === "transcribing") {
      this.btnTranscribe.textContent = "Transcribing...";
    } else {
      this.btnTranscribe.textContent = "✨ Transcribe";
    }

    this.btnRecord.disabled = s === "transcribing" || s === "loading_model";

    this.progressWrap.style.display =
      s === "transcribing" || s === "loading_model" ? "block" : "none";

    const showOutput =
      s === "done" || s === "recording" || s === "transcribing";
    if (!showOutput) this.outputWrap.style.display = "none";

    [
      this.btnCopy,
      this.btnDownloadTxt,
      this.btnDownloadMd,
      this.btnDownloadDocx,
      this.btnPrint,
    ].forEach((btn) => {
      if (btn) btn.disabled = s !== "done";
    });
  },

  showError(msg) {
    const textEl = document.getElementById("transcribe-error-text");
    if (textEl) textEl.textContent = msg;
    else this.errorBox.textContent = "⚠️ " + msg;
    this.errorBox.style.display = "flex";
  },

  hideError() {
    this.errorBox.style.display = "none";
    const textEl = document.getElementById("transcribe-error-text");
    if (textEl) textEl.textContent = "";
  },

  getMeta() {
    return {
      filename: this.currentFile ? this.currentFile.name : "Live Recording",
      language: this.currentResult ? this.currentResult.language : "",
      duration: this.audioDuration,
    };
  },

  getTranscriptText() {
    return this.outputTextarea.value;
  },

  async doCopy() {
    try {
      await Formatters.copyToClipboard(this.getTranscriptText());
      this.flashButton(this.btnCopy, "✓ Copied!", "📋 Copy");
    } catch (e) {
      this.showError("Could not copy to clipboard.");
    }
  },

  doDownloadTxt() {
    const stem = this.currentFile
      ? this.currentFile.name.replace(/\.[^.]+$/, "")
      : "transcript";
    Formatters.download(
      this.getTranscriptText(),
      stem + "_transcript.txt",
      "text/plain",
    );
  },

  doDownloadMd() {
    const stem = this.currentFile
      ? this.currentFile.name.replace(/\.[^.]+$/, "")
      : "transcript";
    const md =
      this.currentResult && this.currentResult.segments
        ? Formatters.toMarkdownWithTimestamps(
            this.currentResult.segments,
            this.getMeta(),
          )
        : Formatters.toMarkdown(this.getTranscriptText(), this.getMeta());
    Formatters.download(md, stem + "_report.md", "text/markdown");
  },

  async doDownloadDocx() {
    const stem = this.currentFile
      ? this.currentFile.name.replace(/\.[^.]+$/, "")
      : "transcript";
    try {
      const result = await Formatters.toDocx(
        this.getTranscriptText(),
        this.getMeta(),
      );
      const blob = new Blob([result.content], { type: result.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = stem + "_report." + result.ext;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      this.showError("Could not generate document: " + e.message);
    }
  },

  doPrint() {
    const text = this.getTranscriptText();
    const meta = this.getMeta();
    const wc = wordCount(text);
    const win = window.open("", "_blank");
    win.document.write(
      `<!DOCTYPE html><html><head><title>Transcript — ${escapeHtml(meta.filename)}</title><style>body { font-family: Georgia, serif; max-width: 760px; margin: 40px auto; color: #111; line-height: 1.7; } h1 { font-size: 1.6rem; margin-bottom: 4px; } .meta { color: #666; font-size: 0.9rem; margin-bottom: 32px; border-bottom: 1px solid #eee; padding-bottom: 16px; } pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 1rem; line-height: 1.8; } .footer { margin-top: 48px; color: #999; font-size: 0.8rem; border-top: 1px solid #eee; padding-top: 12px; }</style></head><body><h1>Meeting Transcript</h1><div class="meta"><strong>Source:</strong> ${escapeHtml(meta.filename)} &nbsp;·&nbsp;<strong>Date:</strong> ${now()} &nbsp;·&nbsp;<strong>Words:</strong> ${wc.toLocaleString()}</div><pre>${escapeHtml(text)}</pre><div class="footer">Generated by PhotoSplit Studio &mdash; photosplitstudio.com/transcribe</div></body></html>`,
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  },

  doClear() {
    this.outputTextarea.value = "";
    this.currentResult = null;
    this.updateWordCount("");
    this.outputWrap.style.display = "none";
    if (this.detectedLang) this.detectedLang.style.display = "none";
    this.clearFile();
    this.hideError();
    this.setState("idle");
  },

  flashButton(btn, tempText, origText) {
    btn.textContent = tempText;
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = origText;
      btn.disabled = false;
    }, 2000);
  },
};

/* ── Boot ────────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  TranscribeUI.init();
});
