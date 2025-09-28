import express from 'express';
import { DashboardController } from '../controllers/dashboardController.js';

const router = express.Router();

// Get all candidates
router.get('/candidates', DashboardController.getAllCandidates);

// Get candidate details
router.get('/candidates/:id', DashboardController.getCandidateDetails);

// Get dashboard analytics
router.get('/analytics', DashboardController.getAnalytics);

// Delete candidate
router.delete('/candidates/:id', DashboardController.deleteCandidate);

export default router;