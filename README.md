# Contextual AI Sidebar

A browser extension that allows users to perform question-and-answer interactions based on the content of the current webpage, powered by Google's Gemini AI.

**Last Updated:** May 16, 2025

## Overview

Contextual AI Sidebar is a browser extension designed to enhance your browsing experience by providing an interactive way to query webpage content directly within the browser. The extension features a sidebar interface that integrates with the Gemini API for AI-powered responses, provides text-to-speech functionality for answers with user-configurable settings, and allows users to save their Q&A history locally.

## Features

-   **Sidebar Interface**: Easily accessible via toolbar icon, context menu, or keyboard shortcut
-   **Content Extraction**: Automatically uses selected text or extracts main content from the webpage
-   **AI-Powered Q&A**: Ask questions about the webpage content and get answers from Gemini AI
-   **Text-to-Speech**: Listen to answers with customizable voice, speed, pitch, and volume
-   **Q&A History**: Save and manage your question-answer pairs for future reference
-   **User Settings**: Configure API key, TTS settings, and history preferences

## Prerequisites

-   A modern Chromium-based browser (Chrome, Edge, etc.)
-   A Gemini API key from [Google AI Studio](https://ai.google.dev/)
-   Node.js and npm (for backend deployment)

## Installation

### Extension Installation

1. Clone this repository:

    ```
    git clone https://github.com/chirag127/Contextual-AI-Sidebar.git
    ```

2. Open your browser and navigate to the extensions page:

    - Chrome: `chrome://extensions/`
    - Edge: `edge://extensions/`

3. Enable "Developer mode" in the top-right corner.

4. Click "Load unpacked" and select the `extension` folder from the cloned repository.

5. The extension should now be installed and visible in your browser toolbar.

### Backend Deployment

The backend server can be deployed to a PaaS like Render, Heroku, or Vercel. Here's how to set it up locally for development:

1. Navigate to the backend directory:

    ```
    cd Contextual-AI-Sidebar/backend
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Create a `.env` file based on `.env.example` and configure your environment variables.

4. Start the server:

    ```
    npm start
    ```

5. The server should now be running at `http://localhost:3000`.

## Usage

1. **Initial Setup**:

    - Click on the extension icon in your browser toolbar to open the sidebar.
    - Go to Settings by clicking the gear icon at the bottom of the sidebar.
    - Enter your Gemini API key and configure other settings as desired.
    - Save your settings.

2. **Asking Questions**:

    - Navigate to any webpage you want to query.
    - Open the sidebar using the toolbar icon, context menu, or keyboard shortcut (default: `Ctrl+Shift+S` or `Cmd+Shift+S`).
    - Type your question in the input field and click "Ask" or press `Ctrl+Enter`.
    - The answer will be displayed in the sidebar.

3. **Using Text-to-Speech**:

    - After receiving an answer, use the TTS controls to listen to it.
    - Play, pause, or stop the speech as needed.
    - Customize TTS settings in the Settings panel.

4. **Managing History**:
    - View your Q&A history by clicking the "History" tab in the sidebar.
    - Copy or delete individual history entries.
    - Clear all history or disable history saving in the Settings panel.

## Project Structure

```
contextual-ai-sidebar/
├── extension/                   # All browser extension code
│   ├── manifest.json
│   ├── icons/
│   │   └── icon16.png (and other sizes)
│   ├── sidebar/                 # HTML, CSS, JS for the sidebar UI
│   │   ├── sidebar.html
│   │   ├── sidebar.css
│   │   └── sidebar.js
│   ├── options/                 # HTML, CSS, JS for the settings page
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   ├── background/              # Background scripts
│   │   └── service-worker.js    # For Manifest V3
│   ├── content_scripts/         # Scripts injected into web pages
│   │   └── content-extractor.js # For extracting page content or interacting with DOM
│   └── utils/                   # Shared utility functions
│       └── tts-handler.js
├── backend/                     # Node.js/Express backend code
│   ├── server.js                # Main server file
│   ├── package.json
│   ├── routes/
│   │   └── api.js               # API routes for Q&A
│   └── services/
│       └── gemini-service.js    # Logic for interacting with Gemini API
└── README.md
```

## API Documentation

### Backend API Endpoints

#### `POST /api/ask`

Get an answer from Gemini based on webpage content and a question.

**Request Body:**

```json
{
    "apiKey": "your-gemini-api-key",
    "pageContent": "The content of the webpage",
    "question": "Your question about the content"
}
```

**Response:**

```json
{
    "answer": "The answer from Gemini AI"
}
```

**Error Responses:**

-   `400 Bad Request`: Missing required parameters
-   `401 Unauthorized`: Invalid API key
-   `429 Too Many Requests`: Rate limit exceeded
-   `500 Internal Server Error`: Server error

## Tech Stack

-   **Extension**:

    -   Manifest V3
    -   HTML, CSS, JavaScript
    -   Chrome Extension APIs
    -   Web Speech API for TTS

-   **Backend**:
    -   Node.js
    -   Express.js
    -   Google Gemini API (@google/genai)
    -   Sentry for error tracking

## Security

-   The Gemini API key is stored securely using `chrome.storage.sync`.
-   The API key is transmitted to the backend exclusively over HTTPS.
-   The backend does not store the user's API key persistently.
-   The extension requests minimal browser permissions necessary for its functionality.

## License

MIT

## Author

Chirag Singhal (GitHub: [chirag127](https://github.com/chirag127))
