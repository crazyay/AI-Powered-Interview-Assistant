import express from 'express';
import { TestController } from '../controllers/testController.js';

const router = express.Router();

// Health check
router.get('/health', TestController.healthCheck);

// Test endpoint for Gemini AI
router.get('/test-gemini', TestController.testGemini);

export default router;