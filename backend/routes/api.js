import express from 'express';
import { getGeminiResponse } from '../services/gemini-service.js';

const router = express.Router();

/**
 * @route POST /api/ask
 * @description Get an answer from Gemini based on webpage content and a question
 * @access Public
 */
router.post('/ask', async (req, res, next) => {
  try {
    const { apiKey, pageContent, question } = req.body;
    
    // Validate request body
    if (!apiKey) {
      return res.status(400).json({ message: 'API key is required' });
    }
    
    if (!pageContent) {
      return res.status(400).json({ message: 'Page content is required' });
    }
    
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }
    
    // Get response from Gemini
    const answer = await getGeminiResponse(apiKey, pageContent, question);
    
    // Send response
    res.json({ answer });
  } catch (error) {
    // Handle specific error types
    if (error.message.includes('API key')) {
      return res.status(401).json({ message: 'Invalid API key. Please check your Gemini API key in the settings.' });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
    }
    
    if (error.message.includes('network')) {
      return res.status(503).json({ message: 'Network error. Please check your internet connection and try again.' });
    }
    
    // Pass other errors to the error handler
    next(error);
  }
});

export default router;
