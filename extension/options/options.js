// DOM Elements
const apiKeyInput = document.getElementById('api-key');
const toggleApiKeyButton = document.getElementById('toggle-api-key');
const backendUrlInput = document.getElementById('backend-url');
const ttsVoiceSelect = document.getElementById('tts-voice');
const ttsSpeedInput = document.getElementById('tts-speed');
const ttsPitchInput = document.getElementById('tts-pitch');
const ttsVolumeInput = document.getElementById('tts-volume');
const speedValueSpan = document.getElementById('speed-value');
const pitchValueSpan = document.getElementById('pitch-value');
const volumeValueSpan = document.getElementById('volume-value');
const testTtsButton = document.getElementById('test-tts');
const historyEnabledCheckbox = document.getElementById('history-enabled');
const clearHistoryButton = document.getElementById('clear-history');
const saveSettingsButton = document.getElementById('save-settings');
const statusMessage = document.getElementById('status-message');

// Default backend URL
const DEFAULT_BACKEND_URL = 'https://contextual-ai-sidebar-backend.onrender.com';

// TTS Handler instance
let ttsHandler = null;

// Initialize the options page
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize TTS handler
  ttsHandler = new TTSHandler();
  await ttsHandler.initialize();
  
  // Load settings
  await loadSettings();
  
  // Set up event listeners
  setupEventListeners();
  
  // Populate voice options
  populateVoiceOptions();
  
  // Update range value displays
  updateRangeValueDisplays();
});

// Set up event listeners
function setupEventListeners() {
  // Toggle API key visibility
  toggleApiKeyButton.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleApiKeyButton.querySelector('svg').innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>';
    } else {
      apiKeyInput.type = 'password';
      toggleApiKeyButton.querySelector('svg').innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>';
    }
  });
  
  // Range input event listeners
  ttsSpeedInput.addEventListener('input', () => {
    const speedValue = mapSpeedValue(parseInt(ttsSpeedInput.value));
    speedValueSpan.textContent = speedValue.toFixed(1);
  });
  
  ttsPitchInput.addEventListener('input', () => {
    const pitchValue = mapPitchValue(parseInt(ttsPitchInput.value));
    pitchValueSpan.textContent = pitchValue.toFixed(1);
  });
  
  ttsVolumeInput.addEventListener('input', () => {
    const volumeValue = mapVolumeValue(parseInt(ttsVolumeInput.value));
    volumeValueSpan.textContent = volumeValue.toFixed(1);
  });
  
  // Test TTS button
  testTtsButton.addEventListener('click', () => {
    const selectedVoice = ttsVoiceSelect.value;
    const speed = mapSpeedValue(parseInt(ttsSpeedInput.value));
    const pitch = mapPitchValue(parseInt(ttsPitchInput.value));
    const volume = mapVolumeValue(parseInt(ttsVolumeInput.value));
    
    // Update TTS settings
    ttsHandler.updateSettings({
      voiceURI: selectedVoice,
      rate: speed,
      pitch: pitch,
      volume: volume
    });
    
    // Test the voice
    ttsHandler.play('This is a test of the text-to-speech feature with the current settings.');
  });
  
  // Clear history button
  clearHistoryButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all Q&A history? This action cannot be undone.')) {
      await chrome.storage.local.set({ history: [] });
      showStatus('History cleared successfully!', 'success');
    }
  });
  
  // Save settings button
  saveSettingsButton.addEventListener('click', saveSettings);
}

// Load settings from storage
async function loadSettings() {
  const settings = await chrome.storage.sync.get([
    'apiKey',
    'backendUrl',
    'ttsVoiceURI',
    'ttsRate',
    'ttsPitch',
    'ttsVolume',
    'historyEnabled'
  ]);
  
  // Set API key
  if (settings.apiKey) {
    apiKeyInput.value = settings.apiKey;
  }
  
  // Set backend URL
  backendUrlInput.value = settings.backendUrl || DEFAULT_BACKEND_URL;
  
  // Set history enabled
  historyEnabledCheckbox.checked = settings.historyEnabled !== false; // Default to true
  
  // Load TTS settings
  await ttsHandler.loadSettings();
  
  // Set TTS controls based on loaded settings
  if (ttsHandler.settings.voiceURI) {
    ttsVoiceSelect.value = ttsHandler.settings.voiceURI;
  }
  
  ttsSpeedInput.value = mapSpeedToSlider(ttsHandler.settings.rate);
  ttsPitchInput.value = mapPitchToSlider(ttsHandler.settings.pitch);
  ttsVolumeInput.value = mapVolumeToSlider(ttsHandler.settings.volume);
}

// Save settings to storage
async function saveSettings() {
  const apiKey = apiKeyInput.value.trim();
  const backendUrl = backendUrlInput.value.trim() || DEFAULT_BACKEND_URL;
  const historyEnabled = historyEnabledCheckbox.checked;
  
  // Get TTS settings
  const voiceURI = ttsVoiceSelect.value;
  const rate = mapSpeedValue(parseInt(ttsSpeedInput.value));
  const pitch = mapPitchValue(parseInt(ttsPitchInput.value));
  const volume = mapVolumeValue(parseInt(ttsVolumeInput.value));
  
  try {
    // Save settings to storage
    await chrome.storage.sync.set({
      apiKey,
      backendUrl,
      historyEnabled,
      ttsVoiceURI: voiceURI,
      ttsRate: rate,
      ttsPitch: pitch,
      ttsVolume: volume
    });
    
    // Update TTS handler settings
    ttsHandler.updateSettings({
      voiceURI,
      rate,
      pitch,
      volume
    });
    
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings. Please try again.', 'error');
  }
}

// Populate voice options in the select element
function populateVoiceOptions() {
  // Clear existing options
  ttsVoiceSelect.innerHTML = '';
  
  // Get available voices
  const voices = ttsHandler.getVoices();
  
  // Add options for each voice
  voices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.voiceURI;
    option.textContent = `${voice.name} (${voice.lang})`;
    ttsVoiceSelect.appendChild(option);
  });
  
  // Select the current voice if set
  if (ttsHandler.settings.voiceURI) {
    ttsVoiceSelect.value = ttsHandler.settings.voiceURI;
  }
}

// Update range value displays
function updateRangeValueDisplays() {
  speedValueSpan.textContent = mapSpeedValue(parseInt(ttsSpeedInput.value)).toFixed(1);
  pitchValueSpan.textContent = mapPitchValue(parseInt(ttsPitchInput.value)).toFixed(1);
  volumeValueSpan.textContent = mapVolumeValue(parseInt(ttsVolumeInput.value)).toFixed(1);
}

// Map speed slider value (0-16) to actual rate (0.1-10)
function mapSpeedValue(sliderValue) {
  if (sliderValue <= 8) {
    // 0-8 maps to 0.1-1.0 (slower to normal)
    return 0.1 + (sliderValue * 0.9 / 8);
  } else {
    // 9-16 maps to 1.0-10.0 (normal to faster)
    return 1.0 + ((sliderValue - 8) * 9.0 / 8);
  }
}

// Map pitch slider value (0-20) to actual pitch (0.1-2.0)
function mapPitchValue(sliderValue) {
  return 0.1 + (sliderValue * 1.9 / 20);
}

// Map volume slider value (0-10) to actual volume (0.1-1.0)
function mapVolumeValue(sliderValue) {
  return 0.1 + (sliderValue * 0.9 / 10);
}

// Map rate value to slider position
function mapSpeedToSlider(rate) {
  if (rate <= 1.0) {
    // 0.1-1.0 maps to 0-8
    return Math.round((rate - 0.1) * 8 / 0.9);
  } else {
    // 1.0-10.0 maps to 8-16
    return Math.round(8 + ((rate - 1.0) * 8 / 9.0));
  }
}

// Map pitch value to slider position
function mapPitchToSlider(pitch) {
  return Math.round((pitch - 0.1) * 20 / 1.9);
}

// Map volume value to slider position
function mapVolumeToSlider(volume) {
  return Math.round((volume - 0.1) * 10 / 0.9);
}

// Show status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message ' + type;
  
  // Clear the message after 3 seconds
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }, 3000);
}
