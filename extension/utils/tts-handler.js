/**
 * TTSHandler - A utility class for handling text-to-speech functionality
 */
class TTSHandler {
  constructor() {
    // Initialize properties
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.voices = [];
    this.settings = {
      voiceURI: '',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    };
    this.isInitialized = false;
  }
  
  /**
   * Initialize the TTS handler
   * @returns {Promise} A promise that resolves when initialization is complete
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }
    
    // Load voices
    await this.loadVoices();
    
    // Load settings
    await this.loadSettings();
    
    this.isInitialized = true;
  }
  
  /**
   * Load available voices
   * @returns {Promise} A promise that resolves when voices are loaded
   */
  async loadVoices() {
    // Check if voices are already available
    this.voices = this.synth.getVoices();
    
    if (this.voices.length > 0) {
      return;
    }
    
    // If voices are not available yet, wait for them to load
    return new Promise((resolve) => {
      const voicesChangedHandler = () => {
        this.voices = this.synth.getVoices();
        this.synth.removeEventListener('voiceschanged', voicesChangedHandler);
        resolve();
      };
      
      this.synth.addEventListener('voiceschanged', voicesChangedHandler);
      
      // Set a timeout in case the event never fires
      setTimeout(() => {
        this.voices = this.synth.getVoices();
        this.synth.removeEventListener('voiceschanged', voicesChangedHandler);
        resolve();
      }, 1000);
    });
  }
  
  /**
   * Get available voices
   * @returns {Array} Array of available voices
   */
  getVoices() {
    return this.voices;
  }
  
  /**
   * Load TTS settings from storage
   * @returns {Promise} A promise that resolves when settings are loaded
   */
  async loadSettings() {
    const settings = await chrome.storage.sync.get([
      'ttsVoiceURI',
      'ttsRate',
      'ttsPitch',
      'ttsVolume'
    ]);
    
    // Update settings with stored values or defaults
    this.settings.voiceURI = settings.ttsVoiceURI || '';
    this.settings.rate = settings.ttsRate || 1.0;
    this.settings.pitch = settings.ttsPitch || 1.0;
    this.settings.volume = settings.ttsVolume || 1.0;
    
    // If no voice is set, try to set a default voice
    if (!this.settings.voiceURI && this.voices.length > 0) {
      // Try to find a voice in the user's language
      const userLanguage = navigator.language || 'en-US';
      const languageVoice = this.voices.find(voice => voice.lang === userLanguage);
      
      if (languageVoice) {
        this.settings.voiceURI = languageVoice.voiceURI;
      } else {
        // Fallback to the first available voice
        this.settings.voiceURI = this.voices[0].voiceURI;
      }
      
      // Save the default voice
      await chrome.storage.sync.set({ ttsVoiceURI: this.settings.voiceURI });
    }
  }
  
  /**
   * Update TTS settings
   * @param {Object} newSettings - New settings to apply
   */
  updateSettings(newSettings) {
    // Update settings with new values
    if (newSettings.voiceURI !== undefined) {
      this.settings.voiceURI = newSettings.voiceURI;
    }
    
    if (newSettings.rate !== undefined) {
      this.settings.rate = newSettings.rate;
    }
    
    if (newSettings.pitch !== undefined) {
      this.settings.pitch = newSettings.pitch;
    }
    
    if (newSettings.volume !== undefined) {
      this.settings.volume = newSettings.volume;
    }
    
    // If there's an active utterance, update its settings
    if (this.utterance) {
      this.applySettingsToUtterance(this.utterance);
    }
  }
  
  /**
   * Apply current settings to an utterance
   * @param {SpeechSynthesisUtterance} utterance - The utterance to apply settings to
   */
  applySettingsToUtterance(utterance) {
    // Set voice
    if (this.settings.voiceURI) {
      const voice = this.voices.find(v => v.voiceURI === this.settings.voiceURI);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    // Set other properties
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;
  }
  
  /**
   * Play text using text-to-speech
   * @param {string} text - The text to speak
   */
  play(text) {
    // Stop any current speech
    this.stop();
    
    // Create a new utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    this.applySettingsToUtterance(this.utterance);
    
    // Start speaking
    this.synth.speak(this.utterance);
  }
  
  /**
   * Pause the current speech
   */
  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }
  
  /**
   * Resume the paused speech
   */
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }
  
  /**
   * Stop the current speech
   */
  stop() {
    this.synth.cancel();
    this.utterance = null;
  }
  
  /**
   * Check if speech is currently active
   * @returns {boolean} True if speaking or paused, false otherwise
   */
  isActive() {
    return this.synth.speaking || this.synth.paused;
  }
  
  /**
   * Check if speech is currently paused
   * @returns {boolean} True if paused, false otherwise
   */
  isPaused() {
    return this.synth.paused;
  }
}
