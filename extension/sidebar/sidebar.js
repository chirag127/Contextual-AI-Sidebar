// Global variables
let pageContent = "";
let pageUrl = "";
let pageTitle = "";
let ttsHandler = null;
let historyEnabled = true;
let backendUrl = "https://contextual-ai-sidebar-backend.onrender.com"; // Default backend URL, can be changed in settings

// DOM Elements
const questionInput = document.getElementById("question-input");
const submitButton = document.getElementById("submit-question");
const loadingIndicator = document.getElementById("loading-indicator");
const answerContainer = document.getElementById("answer-container");
const answerText = document.getElementById("answer-text");
const errorContainer = document.getElementById("error-container");
const errorMessage = document.getElementById("error-message");
const ttsPlayButton = document.getElementById("tts-play");
const ttsPauseButton = document.getElementById("tts-pause");
const ttsStopButton = document.getElementById("tts-stop");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const historyStatus = document.getElementById("history-status");
const apiKeyStatus = document.getElementById("api-key-status");
const openSettingsButton = document.getElementById("open-settings");
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// Initialize the sidebar
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize TTS handler
    ttsHandler = new TTSHandler();
    await ttsHandler.initialize();

    // Set up event listeners
    setupEventListeners();

    // Load settings and check API key
    await loadSettings();

    // Request page content from the content script
    requestPageContent();

    // Load history if enabled
    if (historyEnabled) {
        loadHistory();
    }

    // Check if the backend server is reachable
    checkBackendConnection();
});

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const tabId = button.getAttribute("data-tab");
            switchTab(tabId);
        });
    });

    // Question submission
    submitButton.addEventListener("click", handleQuestionSubmit);
    questionInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.ctrlKey) {
            handleQuestionSubmit();
        }
    });

    // TTS controls
    ttsPlayButton.addEventListener("click", () =>
        ttsHandler.play(answerText.textContent)
    );
    ttsPauseButton.addEventListener("click", () => ttsHandler.pause());
    ttsStopButton.addEventListener("click", () => ttsHandler.stop());

    // Settings button
    openSettingsButton.addEventListener("click", () => {
        chrome.runtime.openOptionsPage();
    });
}

// Switch between tabs
function switchTab(tabId) {
    tabButtons.forEach((button) => {
        button.classList.toggle(
            "active",
            button.getAttribute("data-tab") === tabId
        );
    });

    tabContents.forEach((content) => {
        content.classList.toggle("active", content.id === tabId);
    });

    // If switching to history tab, refresh history
    if (tabId === "history-tab" && historyEnabled) {
        loadHistory();
    }
}

// Request page content from the content script
function requestPageContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        pageUrl = activeTab.url;
        pageTitle = activeTab.title;

        chrome.tabs.sendMessage(
            activeTab.id,
            { action: "getPageContent" },
            (response) => {
                if (response && response.content) {
                    pageContent = response.content;
                } else {
                    showError(
                        "Could not extract page content. Please try refreshing the page."
                    );
                }
            }
        );
    });
}

// Handle question submission
async function handleQuestionSubmit() {
    const question = questionInput.value.trim();

    if (!question) {
        showError("Please enter a question.");
        return;
    }

    if (!pageContent) {
        showError(
            "Page content not available. Please try refreshing the page."
        );
        return;
    }

    // Get API key from storage
    const { apiKey } = await chrome.storage.sync.get("apiKey");

    if (!apiKey) {
        showError(
            "Gemini API key not set. Please add your API key in the settings."
        );
        return;
    }

    // Show loading indicator
    showLoading(true);
    hideAnswer();
    hideError();

    try {
        // Send request to backend
        const response = await fetch(`${backendUrl}/api/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apiKey,
                pageContent,
                question,
            }),
        });

        // Check if the response is ok
        if (!response.ok) {
            // Try to parse as JSON first
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to get answer from Gemini API"
                );
            } else {
                // If not JSON, get the text response
                const errorText = await response.text();
                if (errorText.includes("Not Found")) {
                    throw new Error(
                        `Backend server not found. Please check the backend URL in settings (${backendUrl})`
                    );
                } else {
                    throw new Error(
                        `Server error: ${
                            errorText || response.statusText || "Unknown error"
                        }`
                    );
                }
            }
        }

        // Try to parse the response as JSON
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error("Error parsing JSON:", jsonError);
            throw new Error(
                "Invalid response from server. Please check the backend URL in settings."
            );
        }

        // Check if the answer exists in the response
        if (!data || !data.answer) {
            throw new Error(
                "Invalid response format from server. Answer not found."
            );
        }

        // Display the answer
        showAnswer(data.answer);

        // Save to history if enabled
        if (historyEnabled) {
            saveToHistory(question, data.answer);
        }
    } catch (error) {
        showError(
            error.message || "An error occurred while getting the answer."
        );
        console.error("Error:", error);
    } finally {
        showLoading(false);
    }
}

// Show loading indicator
function showLoading(isLoading) {
    loadingIndicator.classList.toggle("hidden", !isLoading);
    submitButton.disabled = isLoading;
}

// Show answer
function showAnswer(answer) {
    answerText.textContent = answer;
    answerContainer.classList.remove("hidden");
}

// Hide answer
function hideAnswer() {
    answerContainer.classList.add("hidden");
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");
}

// Hide error message
function hideError() {
    errorContainer.classList.add("hidden");
}

// Load settings from storage
async function loadSettings() {
    const settings = await chrome.storage.sync.get([
        "apiKey",
        "historyEnabled",
        "backendUrl",
    ]);

    // Check if API key is set
    if (settings.apiKey) {
        apiKeyStatus.textContent = "API Key: Set ✓";
        apiKeyStatus.classList.add("valid");
    } else {
        apiKeyStatus.textContent = "API Key: Not Set ⚠️";
        apiKeyStatus.classList.add("invalid");
    }

    // Set history enabled flag
    historyEnabled = settings.historyEnabled !== false; // Default to true

    // Update history status text
    historyStatus.textContent = historyEnabled
        ? "History is enabled"
        : "History is disabled";

    // Set backend URL if provided
    if (settings.backendUrl) {
        backendUrl = settings.backendUrl;
    }

    // Load TTS settings
    await ttsHandler.loadSettings();
}

// Check if the backend server is reachable
async function checkBackendConnection() {
    try {
        // Try to connect to the health endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${backendUrl}/health`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(
                `Backend server health check failed: ${response.status} ${response.statusText}`
            );
        } else {
            console.log("Backend server is reachable");
        }
    } catch (error) {
        console.error("Backend connection error:", error);

        // Show a non-blocking warning about the backend connection
        const warningMessage = `Warning: Could not connect to the backend server at ${backendUrl}. Please check your connection or the backend URL in settings.`;

        // Create a warning element if it doesn't exist
        let warningElement = document.getElementById("backend-warning");
        if (!warningElement) {
            warningElement = document.createElement("div");
            warningElement.id = "backend-warning";
            warningElement.className = "warning-message";
            warningElement.style.cssText = `
                background-color: #FFF3CD;
                color: #856404;
                padding: 8px 12px;
                border-radius: 4px;
                margin-bottom: 16px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            `;

            // Add a close button
            const closeButton = document.createElement("button");
            closeButton.innerHTML = "&times;";
            closeButton.style.cssText = `
                background: none;
                border: none;
                font-size: 16px;
                cursor: pointer;
                margin-left: 8px;
            `;
            closeButton.addEventListener("click", () => {
                warningElement.remove();
            });

            // Add the message and close button to the warning element
            const messageSpan = document.createElement("span");
            messageSpan.textContent = warningMessage;
            warningElement.appendChild(messageSpan);
            warningElement.appendChild(closeButton);

            // Insert at the top of the Q&A tab
            const qaTab = document.getElementById("qa-tab");
            qaTab.insertBefore(warningElement, qaTab.firstChild);
        }
    }
}

// Save Q&A to history
async function saveToHistory(question, answer) {
    const historyItem = {
        question,
        answer,
        url: pageUrl,
        title: pageTitle,
        timestamp: new Date().toISOString(),
    };

    // Get existing history
    const { history = [] } = await chrome.storage.local.get("history");

    // Add new item to the beginning
    history.unshift(historyItem);

    // Limit history to 50 items
    const limitedHistory = history.slice(0, 50);

    // Save updated history
    await chrome.storage.local.set({ history: limitedHistory });
}

// Load history from storage
async function loadHistory() {
    const { history = [] } = await chrome.storage.local.get("history");

    // Clear history list
    historyList.innerHTML = "";

    // Show empty message if no history
    if (history.length === 0) {
        historyEmpty.classList.remove("hidden");
        historyList.classList.add("hidden");
        return;
    }

    // Hide empty message and show history list
    historyEmpty.classList.add("hidden");
    historyList.classList.remove("hidden");

    // Add history items to the list
    history.forEach((item, index) => {
        const historyItem = createHistoryItem(item, index);
        historyList.appendChild(historyItem);
    });
}

// Create a history item element
function createHistoryItem(item, index) {
    const { question, answer, url, title, timestamp } = item;

    // Create history item container
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.setAttribute("data-index", index);

    // Format timestamp
    const date = new Date(timestamp);
    const formattedDate =
        date.toLocaleDateString() + " " + date.toLocaleTimeString();

    // Create history item content
    historyItem.innerHTML = `
    <div class="history-item-header">
      <div class="history-item-question">${question}</div>
      <div class="history-item-timestamp">${formattedDate}</div>
    </div>
    <div class="history-item-url" title="${url}">${title}</div>
    <div class="history-item-actions">
      <button class="history-action-button view-answer">View Answer</button>
      <button class="history-action-button copy-answer">Copy Answer</button>
      <button class="history-action-button delete-item">Delete</button>
    </div>
  `;

    // Add event listeners to buttons
    historyItem.querySelector(".view-answer").addEventListener("click", () => {
        // Switch to Q&A tab and show the answer
        switchTab("qa-tab");
        showAnswer(answer);
        questionInput.value = question;
    });

    historyItem.querySelector(".copy-answer").addEventListener("click", () => {
        navigator.clipboard
            .writeText(answer)
            .then(() => {
                const copyButton = historyItem.querySelector(".copy-answer");
                copyButton.textContent = "Copied!";
                setTimeout(() => {
                    copyButton.textContent = "Copy Answer";
                }, 2000);
            })
            .catch((err) => {
                console.error("Failed to copy text: ", err);
            });
    });

    historyItem
        .querySelector(".delete-item")
        .addEventListener("click", async () => {
            // Get existing history
            const { history = [] } = await chrome.storage.local.get("history");

            // Remove the item
            history.splice(index, 1);

            // Save updated history
            await chrome.storage.local.set({ history });

            // Reload history
            loadHistory();
        });

    return historyItem;
}
