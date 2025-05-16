// Global variables
let sidebarInjected = false;
let sidebarElement = null;
let sidebarIframe = null;

// Listen for messages from the background script or sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "ping") {
        // Used to check if content script is injected
        sendResponse({ success: true });
        return;
    }

    if (message.action === "injectSidebar") {
        injectSidebar(message.sidebarUrl, message.width);
        sendResponse({ success: true });
    } else if (message.action === "removeSidebar") {
        removeSidebar();
        sendResponse({ success: true });
    } else if (message.action === "getPageContent") {
        const content = getPageContent();
        sendResponse({ content });
    } else if (message.action === "isSidebarInjected") {
        sendResponse({ isInjected: sidebarInjected });
    }
});

// Inject the sidebar into the page
function injectSidebar(sidebarUrl, width) {
    // If sidebar is already injected, just show it
    if (sidebarInjected && sidebarElement) {
        sidebarElement.style.display = "block";
        return;
    }

    // Create sidebar container
    sidebarElement = document.createElement("div");
    sidebarElement.id = "contextual-ai-sidebar-container";
    sidebarElement.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: ${width}px;
    height: 100vh;
    z-index: 2147483647;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
    background-color: white;
    transition: transform 0.3s ease;
  `;

    // Create iframe for the sidebar
    sidebarIframe = document.createElement("iframe");
    sidebarIframe.src = sidebarUrl;
    sidebarIframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background-color: white;
  `;

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.id = "contextual-ai-sidebar-close";
    closeButton.innerHTML = "&times;";
    closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    left: -30px;
    width: 30px;
    height: 30px;
    background-color: white;
    border: none;
    border-radius: 50% 0 0 50%;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    z-index: 2147483647;
  `;

    // Add event listener to close button
    closeButton.addEventListener("click", removeSidebar);

    // Append elements to the sidebar
    sidebarElement.appendChild(sidebarIframe);
    sidebarElement.appendChild(closeButton);

    // Append sidebar to the body
    document.body.appendChild(sidebarElement);

    // Adjust body padding to make room for the sidebar
    const originalBodyPadding = window.getComputedStyle(
        document.body
    ).paddingRight;
    document.body.style.paddingRight = `${
        parseInt(originalBodyPadding) + width
    }px`;

    // Set flag to indicate sidebar is injected
    sidebarInjected = true;
}

// Remove the sidebar from the page
function removeSidebar() {
    if (sidebarElement) {
        // Hide the sidebar
        sidebarElement.style.display = "none";

        // Reset body padding
        document.body.style.paddingRight = "";

        // Set flag to indicate sidebar is removed
        sidebarInjected = false;
    }
}

// Get the content of the page
function getPageContent() {
    // Check if there's selected text
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        return selectedText;
    }

    // If no text is selected, return the entire page content
    return getFullPageContent();
}

// Get the full content of the page
function getFullPageContent() {
    // Get all text content from the document body
    const fullContent = document.body.innerText;

    // Clean the text to remove excessive whitespace
    return cleanText(fullContent);
}

// Clean text by removing extra whitespace and normalizing line breaks
function cleanText(text) {
    return text
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();
}
