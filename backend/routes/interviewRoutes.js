import express from 'express';
import { InterviewController } from '../controllers/interviewController.js';

const router = express.Router();

// Start interview session
router.post('/start', InterviewController.startInterview);

// Get current question
router.get('/:interviewId/question', InterviewController.getCurrentQuestion);

// Submit answer
router.post('/:interviewId/answer', InterviewController.submitAnswer);

// Get interview results
router.get('/:interviewId/results', InterviewController.getResults);

// Resume incomplete interview
router.get('/:interviewId/resume', InterviewController.resumeInterview);

// Finish interview early
router.post('/:interviewId/finish', InterviewController.finishInterviewEarly);

export default router;