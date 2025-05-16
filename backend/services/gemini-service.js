import { GoogleGenAI } from "@google/genai";

/**
 * Get a response from the Gemini API
 * @param {string} userApiKey - The user's Gemini API key
 * @param {string} pageContent - The content of the webpage
 * @param {string} userQuestion - The user's question
 * @returns {Promise<string>} The response from Gemini
 */
export async function getGeminiResponse(userApiKey, pageContent, userQuestion) {
    try {
        // Initialize the Google GenAI client with the user's API key
        const ai = new GoogleGenAI({
            apiKey: userApiKey,
        });

        // Configure the request
        const config = {
            responseMimeType: "text/plain",
        };

        // Use the latest Gemini model
        const model = "gemini-2.5-flash-preview-04-17";

        // Prepare the content for the request
        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: `Webpage Content:\n${pageContent}\n\nQuestion:\n${userQuestion}`,
                    },
                ],
            },
        ];

        // Generate a streaming response
        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        // Accumulate the response chunks
        let fullText = "";
        for await (const chunk of response) {
            fullText += chunk.text;
        }

        return fullText;
    } catch (error) {
        console.error("Gemini API Error:", error);

        // Handle specific error types
        if (error.message.includes("API key")) {
            throw new Error(
                "Invalid API key. Please check your Gemini API key in the settings."
            );
        }

        if (error.message.includes("rate limit") || error.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }

        if (error.message.includes("network") || !navigator.onLine) {
            throw new Error(
                "Network error. Please check your internet connection and try again."
            );
        }

        // Throw a generic error for other cases
        throw new Error("Error getting response from Gemini: " + error.message);
    }
}
