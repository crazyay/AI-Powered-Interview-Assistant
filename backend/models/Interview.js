import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  timeLimit: {
    type: Number,
    required: true,
    min: 10,
    max: 300 // 5 minutes max
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  expectedAnswer: {
    type: String,
    required: true,
    trim: true
  }
});

const answerSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: ''
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const interviewSchema = new mongoose.Schema({
  candidateInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  questions: [questionSchema],
  currentQuestionIndex: {
    type: Number,
    default: 0,
    min: 0
  },
  answers: [answerSchema],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'error'],
    default: 'in-progress'
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
  duration: {
    type: Number, // in minutes
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
interviewSchema.index({ 'candidateInfo.email': 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ startTime: -1 });

// Virtual for calculating interview duration
interviewSchema.virtual('interviewDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
  }
  return null;
});

export const Interview = mongoose.model('Interview', interviewSchema);