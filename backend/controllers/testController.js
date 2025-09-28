import { model } from '../config/gemini.js';
import { cleanGeminiResponse } from '../utils/helpers.js';

export class TestController {
  // Health check
  static healthCheck(req, res) {
    res.json({ status: 'OK', message: 'AI Interview Assistant Backend - Powered by Gemini AI' });
  }

  // Test endpoint for Gemini AI
  static async testGemini(req, res) {
    try {
      const testPrompt = 'Generate a simple JSON object with a "message" field containing "Hello from Gemini AI". Return ONLY the JSON object without markdown formatting.';
      
      const result = await model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = cleanGeminiResponse(text);
      console.log('Test Gemini response:', cleanedText);
      
      const parsed = JSON.parse(cleanedText);
      
      res.json({ 
        success: true, 
        geminiResponse: parsed,
        rawResponse: text
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.toString()
      });
    }
  }
}