/**
 * PhotoSplit Studio — premium.js
 * Futuristic Features: Voice Control, Advanced Haptics, Sentiment UI
 */

'use strict';

const PremiumEngine = {
  recognition: null,
  isListening: false,

  init() {
    this.initVoice();
    this.initHaptics();
    this.initOLEDMode();
    console.log('🚀 Premium Engine Initialized');
  },

  /* 🎙️ VOICE NAVIGATION ══════════════════════════════════════════════════ */
  initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Voice navigation not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('🎙️ Voice Command:', transcript);
      this.handleCommand(transcript);
    };

    this.recognition.onerror = (err) => {
      console.error('Speech recognition error:', err.error);
      this.isListening = false;
      this.updateVoiceUI();
    };
  },

  toggleVoice() {
    if (!this.recognition) return;
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      UIController.showToast('Voice control OFF', 'info', 1500);
    } else {
      this.recognition.start();
      this.isListening = true;
      UIController.showToast('Listening for commands...', 'success', 2000);
    }
    this.updateVoiceUI();
  },

  updateVoiceUI() {
    const btn = document.getElementById('btn-voice-toggle');
    if (btn) {
      btn.classList.toggle('active', this.isListening);
      btn.innerHTML = this.isListening ? '🎙️ Listening...' : '🎙️ Voice Control';
    }
  },

  handleCommand(cmd) {
    if (cmd.includes('scan') || cmd.includes('split') || cmd.includes('detect')) {
      if (typeof runDetection === 'function') runDetection();
    } else if (cmd.includes('save') || cmd.includes('download') || cmd.includes('export')) {
      if (typeof saveAll === 'function') saveAll();
    } else if (cmd.includes('zoom in')) {
      if (typeof zoomIn === 'function') zoomIn();
    } else if (cmd.includes('zoom out')) {
      if (typeof zoomOut === 'function') zoomOut();
    } else if (cmd.includes('zoom fit')) {
      if (typeof zoomFit === 'function') zoomFit();
    } else if (cmd.includes('rotate')) {
      if (typeof rotateScan === 'function') rotateScan(90);
    } else if (cmd.includes('undo')) {
      if (typeof undo === 'function') undo();
    } else if (cmd.includes('redo')) {
      if (typeof redo === 'function') redo();
    } else if (cmd.includes('dark mode')) {
      if (typeof toggleDarkMode === 'function') toggleDarkMode();
    }
  },

  /* 🌑 OLED DARK MODE ══════════════════════════════════════════════════ */
  initOLEDMode() {
    // Check system preference
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.matches && !document.documentElement.dataset.theme) {
      // Auto-enable if system is dark
      // Note: app.js handles the basic toggle, we enhance the CSS
    }
  },

  /* 📳 ADVANCED HAPTICS ════════════════════════════════════════════════ */
  initHaptics() {
    // Enhance existing triggerHaptic in app.js
    window.hapticSuccess = () => triggerHaptic('medium');
    window.hapticError = () => triggerHaptic('heavy');
  }
};

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  PremiumEngine.init();
});
