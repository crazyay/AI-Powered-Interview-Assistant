import express from 'express';
import { ResumeController } from '../controllers/resumeController.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// Parse resume endpoint
router.post('/parse', upload.single('resume'), ResumeController.parseResume);

export default router;