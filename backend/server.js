import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import database connection
import { connectDB } from './config/database.js';

// Import routes
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import testRoutes from './routes/testRoutes.js';
import apiStatsRoutes from './routes/apiStatsRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', testRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stats', apiStatsRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 AI Interview Assistant Backend running on port ${PORT}`);
  console.log(`📊 Dashboard API available at http://localhost:${PORT}/api/dashboard/candidates`);
  console.log(`📈 API Stats available at http://localhost:${PORT}/api/stats/stats`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/api/health`);
});