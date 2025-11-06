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
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 4;
      },
      message: 'Question must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    default: ''
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
  selectedOption: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1  // MCQ: 1 mark per question
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const interviewSchema = new mongoose.Schema({
  testMode: {
    type: String,
    enum: ['resume', 'custom'],
    default: 'resume'
  },
  topics: {
    type: [String],
    default: []
  },
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