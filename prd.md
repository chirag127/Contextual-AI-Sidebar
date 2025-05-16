
**Contextual AI Sidebar - Product Requirements Document (PRD)**

**Document Version:** 1.0
**Last Updated:** [current date]
**Owner:** Chirag Singhal
**Status:** Final
**Prepared for:** Augment Code Assistant
**Prepared by:** Chirag Singhal

---

**1. Introduction & Overview**

*   **1.1. Purpose**
    This document outlines the requirements for "Contextual AI Sidebar," a browser extension designed to allow users to perform question-and-answer interactions based on the content of the current webpage. The extension will feature a sidebar interface, integrate with the Gemini API for AI-powered responses, provide text-to-speech (TTS) functionality for answers with user-configurable settings, and allow users to save their Q&A history locally.

*   **1.2. Problem Statement**
    Users often need to quickly understand, summarize, or find specific information within lengthy or complex web content. Switching contexts or manually sifting through text is inefficient. This extension aims to provide an immediate, interactive way to query webpage content directly within the browser, enhancing productivity and comprehension.

**2. Goals & Objectives**

*   **2.1. Project Goals**
    *   Deliver a highly functional and intuitive browser extension that seamlessly integrates into the user's browsing experience.
    *   Enable users to leverage the power of the Gemini AI model for contextual Q&A on any webpage.
    *   Provide accessible features, including comprehensive TTS controls.
    *   Ensure user control and transparency regarding API key usage.

*   **2.2. Product Goals**
    *   Allow users to easily activate and interact with a sidebar on any webpage.
    *   Provide accurate and relevant answers to user questions based on webpage content via Gemini API.
    *   Offer a clear and pleasant text-to-speech experience for answers, with customizable speed, pitch, volume, and voice.
    *   Enable users to store and manage their Gemini API key securely.
    *   Allow users to save and revisit their Q&A history for future reference.
    *   Offer a user-friendly settings panel for all configurations.

**3. Scope**

*   **3.1. In Scope**
    *   Browser extension compatible with modern Chromium-based browsers (e.g., Chrome, Edge).
    *   Sidebar UI activated via:
        *   Browser toolbar icon click.
        *   Right-click context menu option.
        *   Default keyboard shortcut (e.g., `Ctrl+Shift+S` / `Cmd+Shift+S`), user-configurable via browser's native extension shortcut settings.
    *   Extraction of webpage content:
        *   If user has selected text, use selected text.
        *   Otherwise, extract main readable text content from the current page.
    *   Question input via a text field in the sidebar.
    *   Backend Express.js server to:
        *   Receive webpage content and user question from the extension.
        *   Receive user's Gemini API key (sent securely with each request).
        *   Query the Gemini API using the provided key and content.
        *   Stream/send the answer back to the extension.
    *   Display of AI-generated answers in the sidebar (supporting basic text formatting like newlines).
    *   Text-to-Speech (TTS) for answers using the browser's built-in `SpeechSynthesis` API:
        *   Controls in sidebar: Play, Pause, Stop.
        *   Settings in dedicated panel: Speed (0.1x-10x, mapped from a user-friendly 0-16 scale), Pitch, Volume, Voice selection (from available browser voices).
    *   Local Q&A History:
        *   Saving Q&A pairs (question, answer, timestamp, page URL/title) to browser local storage.
        *   Viewing, copying, and deleting individual history entries from within the sidebar.
        *   Option in settings to clear all history.
        *   Option in settings to enable/disable history saving.
    *   Settings Panel:
        *   Input and secure storage (`chrome.storage.sync`) of user's Gemini API key.
        *   Configuration of TTS settings.
        *   Management of Q&A history settings.
        *   Link to a brief help/support resource.
    *   User-friendly error messages for common issues (e.g., invalid API key, network errors).
    *   Integration with an error tracking service like Sentry for frontend and backend.

*   **3.2. Out of Scope**
    *   User accounts or cloud-based synchronization of API keys or history.
    *   Support for browsers not based on Chromium.
    *   Advanced content extraction beyond main text or user selection (e.g., complex table data, interactive elements).
    *   Voice input for questions.
    *   Direct integration with cloud-based TTS services (uses browser native TTS).
    *   Summarization feature distinct from Q&A.
    *   Saving webpage snapshots or full-page content.
    *   Analytics beyond error tracking (unless a privacy-focused one is explicitly added).

**4. User Personas & Scenarios**

*   **4.1. Key User Persona:**
    A "Curious Learner & Efficient Professional": Tech-savvy individuals (students, researchers, writers, knowledge workers, or any avid web user) who frequently consume diverse online content and seek efficient ways to understand, query, and extract information without disrupting their workflow.

*   **4.2. Key User Scenarios / Use Cases**
    1.  **Quick Clarification:** Sarah is reading a dense academic article. She encounters a complex concept and, instead of opening a new tab to search, she opens the Contextual AI Sidebar, asks "Explain this concept in simpler terms," and gets an immediate answer based on the article's context.
    2.  **Information Extraction:** Mark is researching competitor websites. He navigates to a product page and uses the sidebar to ask, "What are the key features of this product?" and "What is the pricing model?" getting quick answers.
    3.  **Accessible Learning:** Alex prefers auditory learning. While reading a long blog post, Alex asks a question and then uses the TTS feature to listen to the AI's explanation, adjusting the speed to their preference.
    4.  **Recalling Information:** David previously asked several questions about a specific technical document. A week later, he revisits his Q&A history within the sidebar to quickly find an answer he previously received without needing to re-read or re-query the document.
    5.  **Initial Setup:** Maria installs the extension, opens the settings, enters her Gemini API key, and customizes the TTS voice and speed to her liking.

**5. User Stories**

*   **US1:** As a user, I want to easily open and close the AI sidebar using a toolbar icon, context menu, or keyboard shortcut, so I can access Q&A functionality quickly.
*   **US2:** As a user, I want to securely input and save my Gemini API key in the extension's settings, so the extension can make requests to the Gemini API on my behalf.
*   **US3:** As a user, I want the extension to automatically use the main content of the current webpage (or my selected text) as context when I ask a question.
*   **US4:** As a user, I want to type my question into the sidebar and receive a text-based answer generated by the Gemini AI.
*   **US5:** As a user, I want to listen to the AI's answer read aloud, with controls to play, pause, and stop the audio.
*   **US6:** As a user, I want to customize the text-to-speech voice, speed, pitch, and volume to suit my preferences.
*   **US7:** As a user, I want my questions and their answers to be automatically saved with context (URL/title, timestamp), so I can review them later.
*   **US8:** As a user, I want to view my Q&A history within the sidebar, and be able to copy or delete individual entries.
*   **US9:** As a user, I want to be able to clear my entire Q&A history from the settings panel.
*   **US10:** As a user, I want to enable or disable the Q&A history saving feature.
*   **US11:** As a user, I want to receive clear error messages if my API key is invalid or if there's an issue communicating with the AI.

**6. Functional Requirements (FR)**

*   **6.1. Extension Core & Sidebar UI**
    *   **FR1.1 (Activation):** The extension sidebar must be activatable via:
        *   FR1.1.1: Clicking the extension's icon in the browser toolbar.
        *   FR1.1.2: Selecting an option from the browser's right-click context menu on a webpage.
        *   FR1.1.3: A default keyboard shortcut (e.g., `Ctrl+Shift+S` or `Cmd+Shift+S`).
    *   **FR1.2 (Sidebar Layout):** The sidebar shall display:
        *   FR1.2.1: A text input field for users to type their questions.
        *   FR1.2.2: An area to display answers from the Gemini API.
        *   FR1.2.3: TTS controls (Play/Pause/Stop) associated with the displayed answer.
        *   FR1.2.4: A section or tab to access Q&A History.
        *   FR1.2.5: A link/button to access the main Settings panel.
    *   **FR1.3 (Content Extraction):**
        *   FR1.3.1: If the user has selected text on the page when a question is submitted, this selected text will be used as the primary context.
        *   FR1.3.2: If no text is selected, the extension will attempt to extract the main readable content (e.g., article body, significant text blocks) from the current webpage to use as context. Common non-content elements (navbars, footers, ads) should be excluded.

*   **6.2. AI Question & Answering (Backend: Express.js & Gemini)**
    *   **FR2.1 (Request to Backend):** The extension shall send the user's question, the extracted webpage content, and the user's Gemini API key (from `chrome.storage.sync`) to the backend server via a secure HTTPS request.
    *   **FR2.2 (Backend Gemini Integration):** The Node.js/Express backend shall:
        *   FR2.2.1: Receive the request from the extension.
        *   FR2.2.2: Use the provided Gemini API key to make a `generateContentStream` request to the Gemini API (`gemini-2.5-flash-preview-04-17` model or latest suitable) with the webpage content and user question. The `responseMimeType` should be `text/plain`.
        *   **Gemini Integration Code Snippet (Basis for backend):**
            ```javascript
            // To run this code you need to install the following dependencies:
            // npm install @google/genai
            // (Ensure process.env.GEMINI_API_KEY is dynamically set per-request from user input)

            import { GoogleGenAI } from '@google/genai';

            async function getGeminiResponse(userApiKey, pageContent, userQuestion) {
              const ai = new GoogleGenAI({ apiKey: userApiKey }); // Use userApiKey
              const config = { responseMimeType: 'text/plain' };
              const modelName = 'gemini-2.5-flash-preview-04-17'; // Or a suitable alternative
              const contents = [{
                role: 'user',
                parts: [{ text: `Webpage Content:\n${pageContent}\n\nQuestion:\n${userQuestion}` }],
              }];

              const response = await ai.models.generateContentStream({
                model: modelName,
                config,
                contents,
              });
              // This function would then stream 'chunk.text' back to the client
              // For simplicity in this PRD, we assume the backend handles streaming or accumulates and sends.
              let fullText = "";
              for await (const chunk of response) {
                fullText += chunk.text(); // Ensure correct method to get text
              }
              return fullText; // Or stream directly
            }
            ```
        *   FR2.2.3: Stream the response from Gemini back to the extension or send the complete response.
    *   **FR2.3 (Display Answer):** The extension sidebar shall display the AI-generated answer. Newline characters in the response should be rendered as paragraph breaks or line breaks.

*   **6.3. Text-to-Speech (TTS)**
    *   **FR3.1 (TTS Functionality):** The extension shall use the browser's `SpeechSynthesis` API to read out the displayed AI answers.
    *   **FR3.2 (TTS Controls):** The sidebar shall provide intuitive controls for TTS: Play (starts or resumes TTS), Pause (pauses TTS), Stop (stops TTS and resets).
    *   **FR3.3 (TTS Settings Persistence):** TTS settings (speed, pitch, volume, selected voice URI) shall be stored using `chrome.storage.sync` or `chrome.storage.local` and applied whenever TTS is used.
    *   **FR3.4 (TTS Settings Configuration):** In the settings panel, users can:
        *   FR3.4.1: Adjust speech speed (e.g., a slider from 0-16, mapped internally to `SpeechSynthesisUtterance.rate` typical range like 0.1 to 10).
        *   FR3.4.2: Adjust speech pitch (e.g., a slider, mapped to `SpeechSynthesisUtterance.pitch` typical range 0 to 2).
        *   FR3.4.3: Adjust speech volume (e.g., a slider, mapped to `SpeechSynthesisUtterance.volume` typical range 0 to 1).
        *   FR3.4.4: Select from a list of available voices provided by `speechSynthesis.getVoices()`.

*   **6.4. Q&A History**
    *   **FR4.1 (Saving Q&A):** If history saving is enabled, successfully completed Q&A pairs (user's question, AI's answer, current timestamp, and URL & Title of the webpage) shall be saved to `chrome.storage.local`.
    *   **FR4.2 (Viewing History):** A dedicated section/tab in the sidebar shall list saved Q&A entries, displaying at least the question and page title, expandable to show the full answer.
    *   **FR4.3 (Managing History Entries):** Users shall be able to:
        *   FR4.3.1: Copy the question and/or answer of a history entry.
        *   FR4.3.2: Delete individual history entries.
    *   **FR4.4 (Clearing History):** The settings panel shall provide an option to clear all saved Q&A history with a confirmation prompt.
    *   **FR4.5 (Toggle History Saving):** The settings panel shall allow users to enable or disable the Q&A history saving feature.

*   **6.5. Settings Management**
    *   **FR5.1 (Settings Access):** A dedicated settings page/panel accessible from the sidebar.
    *   **FR5.2 (API Key Management):**
        *   FR5.2.1: An input field for users to enter their Gemini API key.
        *   FR5.2.2: The API key shall be stored securely using `chrome.storage.sync`.
    *   **FR5.3 (TTS Configuration):** As defined in FR3.4.
    *   **FR5.4 (History Configuration):** As defined in FR4.4 and FR4.5.
    *   **FR5.5 (Help/Support Link):** A link to a simple help page or contact information.

*   **6.6. Error Handling & Notifications**
    *   **FR6.1 (Client-Side Errors):** The extension shall display clear, user-friendly messages in the sidebar for errors such as:
        *   Invalid or missing Gemini API key.
        *   Network connectivity issues preventing communication with the backend.
        *   Errors returned from the backend (e.g., Gemini API declining the key, rate limits).
    *   **FR6.2 (Backend Error Logging):** The backend server shall implement robust error logging (e.g., using Sentry or console logs on the PaaS) for any server-side exceptions or issues with the Gemini API.

**7. Non-Functional Requirements (NFR)**

*   **7.1. Performance:**
    *   Sidebar should load and become interactive within 1 second of activation.
    *   Content extraction should be efficient and not noticeably slow down the browser.
    *   Q&A response time will largely depend on Gemini API, but the extension and backend should add minimal overhead (e.g., <500ms combined).
    *   TTS should start within 1 second of user initiation after an answer is loaded.
*   **7.2. Scalability:**
    *   The backend Node.js/Express application, deployed on a PaaS like Render, should be able to handle a reasonable number of concurrent users based on the PaaS tier chosen (e.g., hundreds of requests per minute).
    *   The extension itself runs client-side, so scalability is per-user.
*   **7.3. Usability:**
    *   The UI must be clean, intuitive, and easy to navigate.
    *   Text must be legible, and controls clearly labeled.
    *   Minimal learning curve for new users.
*   **7.4. Reliability / Availability:**
    *   The extension must function reliably on common websites without crashing or causing page errors.
    *   The backend service should aim for high availability (e.g., >99.9%), dependent on the PaaS.
*   **7.5. Security:**
    *   The Gemini API key must be stored using `chrome.storage.sync` (which offers encryption at rest if user sync is on).
    *   The API key must be transmitted from the extension to the backend exclusively over HTTPS.
    *   The backend must not store the user's Gemini API key persistently; it should only be used for the duration of the request to the Gemini API.
    *   The extension should request minimal browser permissions necessary for its functionality.
*   **7.6. Accessibility:**
    *   TTS feature inherently improves accessibility.
    *   UI elements should use appropriate ARIA attributes where necessary for screen reader compatibility.
    *   Sufficient color contrast should be used.

**8. High-Level Technical Stack & Architecture**

*   **Extension (Client-Side):**
    *   Manifest V3
    *   HTML, CSS, JavaScript
    *   Core Browser Extension APIs: `chrome.action`, `chrome.contextMenus`, `chrome.commands`, `chrome.storage.sync`, `chrome.storage.local`, `chrome.scripting` (for content extraction/injection if needed), `chrome.runtime`.
    *   Text-to-Speech: Browser's `window.speechSynthesis` API.
*   **Backend (Server-Side):**
    *   Node.js
    *   Express.js framework
    *   Deployment: PaaS (e.g., Render, Heroku, Vercel Serverless Functions)
*   **AI Integration:**
    *   Google Gemini API via `@google/genai` npm package.
*   **Error Tracking:**
    *   Sentry (or similar) for both extension and backend.

**9. Project Structure Recommendation**

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

**10. Instructions for AI Code Assistant**

*   **Primary Goal:** Develop the "Contextual AI Sidebar" browser extension and its backend as per the requirements in this PRD.
*   **Gemini Integration:** Strictly use the `@google/genai` library for Gemini API calls. Refer to FR2.2.2 for the conceptual code structure. The user's API key must be passed from the extension to the backend and used dynamically for each Gemini API call.
*   **MCP Server Usage:**
    *   Utilize the `context7 mcp server` to gather contextual information about the current task, including relevant libraries (e.g., `@google/genai`), browser extension APIs, and Express.js best practices. Use it to understand the latest updates and documentation for any third-party API integration or new library/framework usage.
    *   Employ the `sequentialthinking mcp server` to break down complex implementation tasks (e.g., setting up sidebar communication, backend API endpoint, TTS integration) into manageable, sequential steps.
*   **Web Search:** Use the `websearch tool` to find information on specific browser APIs, CSS for sidebars, Node.js patterns, Gemini API query construction, or error handling best practices as needed.
*   **Error Handling:** Implement comprehensive error handling on both client (extension) and server (backend) sides. Integrate Sentry (or a placeholder for it if direct API keys aren't available to you) for error reporting.
*   **Code Quality:** Generate clean, well-commented, and modular code.
*   **Project Structure:** Adhere to the "Project Structure Recommendation" (Section 9). All browser-side code (HTML, CSS, JS for sidebar, options, background scripts, content scripts) should reside within the `extension/` directory.
*   **Security:** Prioritize security, especially in handling the user's Gemini API key as outlined in NFR 7.5.
*   **Final Product Focus:** Ensure all "In Scope" features (Section 3.1) are implemented for a complete final product, not an MVP.

**11. Open Issues / Future Considerations**

*   **11.1. Open Issues**
    *   None identified for this initial "final product" version.
*   **11.2. Future Enhancements (Post-Launch)**
    *   Advanced content extraction logic (e.g., better handling of dynamic content, SPAs).
    *   Support for querying content within PDF files viewed in the browser.
    *   Voice input for asking questions in the sidebar.
    *   Option to use premium cloud-based TTS voices (requiring additional user API keys/subscriptions).
    *   User accounts and cloud synchronization for Q&A history and settings.
    *   Custom prompts or "personas" for the AI.
    *   Inline Q&A (e.g., select text, ask question in a small pop-up).

**13. Document History / Revisions**

*   **Version 1.0** ([current date]): Initial draft by Chirag Singhal.
