// Constants
const SIDEBAR_URL = chrome.runtime.getURL('sidebar/sidebar.html');
const SIDEBAR_WIDTH = 350; // Width in pixels

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Contextual AI Sidebar extension installed');
  
  // Create context menu item
  chrome.contextMenus.create({
    id: 'open-sidebar',
    title: 'Open Contextual AI Sidebar',
    contexts: ['page', 'selection']
  });
  
  // Set default settings if not already set
  initializeDefaultSettings();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'open-sidebar') {
    injectSidebar(tab.id);
  }
});

// Handle browser action (toolbar icon) clicks
chrome.action.onClicked.addListener((tab) => {
  injectSidebar(tab.id);
});

// Handle messages from content scripts or sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSidebar') {
    injectSidebar(sender.tab.id);
    sendResponse({ success: true });
  } else if (message.action === 'closeSidebar') {
    removeSidebar(sender.tab.id);
    sendResponse({ success: true });
  } else if (message.action === 'checkSidebarStatus') {
    // Check if sidebar is already injected
    chrome.tabs.sendMessage(sender.tab.id, { action: 'isSidebarInjected' }, (response) => {
      sendResponse({ isInjected: response && response.isInjected });
    });
    return true; // Keep the message channel open for the async response
  }
});

// Inject the sidebar into the current tab
async function injectSidebar(tabId) {
  try {
    // Check if the content script is already injected
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      // If we get here, the content script is already injected
    } catch (error) {
      // Content script is not injected, so inject it
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content_scripts/content-extractor.js']
      });
    }
    
    // Send message to content script to inject sidebar
    chrome.tabs.sendMessage(tabId, { action: 'injectSidebar', sidebarUrl: SIDEBAR_URL, width: SIDEBAR_WIDTH });
  } catch (error) {
    console.error('Error injecting sidebar:', error);
  }
}

// Remove the sidebar from the current tab
function removeSidebar(tabId) {
  chrome.tabs.sendMessage(tabId, { action: 'removeSidebar' });
}

// Initialize default settings if not already set
async function initializeDefaultSettings() {
  const settings = await chrome.storage.sync.get([
    'ttsRate',
    'ttsPitch',
    'ttsVolume',
    'historyEnabled'
  ]);
  
  // Set default settings if not already set
  const defaultSettings = {};
  
  if (settings.ttsRate === undefined) {
    defaultSettings.ttsRate = 1.0;
  }
  
  if (settings.ttsPitch === undefined) {
    defaultSettings.ttsPitch = 1.0;
  }
  
  if (settings.ttsVolume === undefined) {
    defaultSettings.ttsVolume = 1.0;
  }
  
  if (settings.historyEnabled === undefined) {
    defaultSettings.historyEnabled = true;
  }
  
  // Save default settings
  if (Object.keys(defaultSettings).length > 0) {
    await chrome.storage.sync.set(defaultSettings);
  }
}
