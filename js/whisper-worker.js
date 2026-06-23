/* ═══════════════════════════════════════════════════════════════════════════
   PhotoSplit Studio — whisper-worker.js
   Runs inside a Web Worker. Loads Whisper via Transformers.js (Hugging Face).
   Audio is processed 100% locally — nothing ever leaves the browser.
═══════════════════════════════════════════════════════════════════════════ */

import {
  pipeline,
  env,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js";

// Cache model files in the browser's Cache API (IndexedDB-backed)
env.cacheDir = ".transformers-cache";
env.allowRemoteModels = true;

let transcriber = null;
let currentModel = null;

/**
 * Messages received from the main thread:
 *   { type: 'load',  model: 'whisper-tiny' | 'whisper-base' }
 *   { type: 'transcribe', audio: Float32Array, language: string, timestamps: boolean }
 *   { type: 'cancel' }
 */
self.onmessage = async (event) => {
  const { type } = event.data;

  if (type === "load") {
    await loadModel(event.data.model || "whisper-tiny");
    return;
  }

  if (type === "transcribe") {
    await runTranscription(event.data);
    return;
  }

  if (type === "cancel") {
    // Pipeline doesn't expose a cancellation token yet; we just ignore future messages
    transcriber = null;
    currentModel = null;
  }
};

async function loadModel(modelKey) {
  const MODEL_IDS = {
    "whisper-tiny": "onnx-community/whisper-tiny",
    "whisper-base": "onnx-community/whisper-base",
    "whisper-small": "onnx-community/whisper-small",
  };

  const modelId = MODEL_IDS[modelKey] || MODEL_IDS["whisper-tiny"];

  if (transcriber && currentModel === modelId) {
    self.postMessage({ type: "model-ready", model: modelKey });
    return;
  }

  try {
    self.postMessage({ type: "model-loading", model: modelKey });

    transcriber = await pipeline("automatic-speech-recognition", modelId, {
      device: "webgpu", // Falls back to WASM automatically if WebGPU unavailable
      dtype: "q4", // Quantised — smaller download, faster inference
      progress_callback: (progress) => {
        // progress: { status, name, file, loaded, total, progress }
        if (
          progress.status === "downloading" ||
          progress.status === "progress"
        ) {
          self.postMessage({
            type: "model-progress",
            file: progress.file,
            loaded: progress.loaded,
            total: progress.total,
            progress: Math.round(progress.progress ?? 0),
          });
        } else if (progress.status === "initiate") {
          self.postMessage({
            type: "model-progress",
            file: progress.file,
            progress: 0,
          });
        } else if (progress.status === "done") {
          self.postMessage({ type: "model-file-done", file: progress.file });
        }
      },
    });

    currentModel = modelId;
    self.postMessage({ type: "model-ready", model: modelKey });
  } catch (err) {
    self.postMessage({
      type: "error",
      message: `Failed to load model: ${err.message}`,
    });
    transcriber = null;
    currentModel = null;
  }
}

async function runTranscription({ audio, language, timestamps }) {
  if (!transcriber) {
    self.postMessage({
      type: "error",
      message: "Model not loaded. Please wait for the model to finish loading.",
    });
    return;
  }

  try {
    self.postMessage({ type: "transcription-started" });

    const options = {
      return_timestamps: timestamps ? "word" : false,
      language: language || null,
      chunk_length_s: 30,
      stride_length_s: 5,
      callback_function: (beams) => {
        // Stream partial results as they arrive
        const partial = beams[0]?.output_token_ids ? null : beams[0]?.text;
        if (partial) {
          self.postMessage({ type: "partial", text: partial });
        }
      },
    };

    const result = await transcriber(audio, options);

    self.postMessage({
      type: "result",
      text: result.text || "",
      chunks: result.chunks || null, // Timestamp chunks if requested
    });
  } catch (err) {
    self.postMessage({
      type: "error",
      message: `Transcription failed: ${err.message}`,
    });
  }
}
