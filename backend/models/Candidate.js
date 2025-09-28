import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  totalScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  summary: {
    type: String,
    default: null
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    default: null
  },
  resumeText: {
    type: String,
    default: ''
  },
  lastInterview: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'in-progress'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for faster queries
candidateSchema.index({ email: 1 });
candidateSchema.index({ totalScore: -1 });

export const Candidate = mongoose.model('Candidate', candidateSchema);