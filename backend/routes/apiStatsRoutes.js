import express from 'express';
import { apiCallTracker } from '../utils/apiCallTracker.js';

const router = express.Router();

// Get API call statistics
router.get('/stats', (req, res) => {
  const stats = apiCallTracker.getStats();
  res.json({
    success: true,
    stats,
    warning: stats.callsLastMinute > 10 ? 'Approaching rate limit!' : null,
    geminiLimit: 'Free tier: ~15 requests/minute per region'
  });
});

// Reset API call tracker
router.post('/reset', (req, res) => {
  apiCallTracker.reset();
  res.json({ success: true, message: 'API tracker reset' });
});

export default router;
