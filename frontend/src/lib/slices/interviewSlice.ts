import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  question: string;
  expectedAnswer: string;
}

export interface Answer {
  questionId: number;
  question: string;
  answer: string;
  timeSpent: number;
  score?: number;
  timestamp: string;
}

export interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
  resumeText?: string;
}

export interface InterviewResults {
  totalScore: number;
  averageScore: number;
  timeSpent: number;
  questionsAnswered: number;
  summary: string;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
  answers?: Answer[];
}

export interface InterviewState {
  interviewId: string | null;
  candidateInfo: CandidateInfo | null;
  currentQuestion: Question | null;
  questionNumber: number;
  totalQuestions: number;
  answers: Answer[];
  timeRemaining: number;
  isActive: boolean;
  isFinished: boolean;
  totalScore: number | null;
  summary: string | null;
  startTime: string | null;
  lastSaved: string | null;
  results: InterviewResults | null;
  loading: boolean;
  error: string | null;
  hasExistingInterview: boolean;
}

const initialState: InterviewState = {
  interviewId: null,
  candidateInfo: null,
  currentQuestion: null,
  questionNumber: 0,
  totalQuestions: 6,
  answers: [],
  timeRemaining: 0,
  results: null,
  loading: false,
  error: null,
  hasExistingInterview: false,
  isActive: false,
  isFinished: false,
  totalScore: null,
  summary: null,
  startTime: null,
  lastSaved: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<{
      interviewId: string;
      candidateInfo: CandidateInfo;
      firstQuestion: Question;
    }>) => {
      const { interviewId, candidateInfo, firstQuestion } = action.payload;
      state.interviewId = interviewId;
      state.candidateInfo = candidateInfo;
      state.currentQuestion = firstQuestion;
      state.questionNumber = 1;
      state.timeRemaining = firstQuestion.timeLimit;
      state.isActive = true;
      state.isFinished = false;
      state.startTime = new Date().toISOString();
      state.answers = [];
      state.totalScore = null;
      state.summary = null;
      state.lastSaved = new Date().toISOString();
    },

    setCurrentQuestion: (state, action: PayloadAction<{
      question: Question;
      questionNumber: number;
    }>) => {
      state.currentQuestion = action.payload.question;
      state.questionNumber = action.payload.questionNumber;
      state.timeRemaining = action.payload.question.timeLimit;
      state.lastSaved = new Date().toISOString();
    },

    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = Math.max(0, action.payload);
    },

    submitAnswer: (state, action: PayloadAction<{
      answer: string;
      timeSpent: number;
    }>) => {
      if (state.currentQuestion) {
        const newAnswer: Answer = {
          questionId: state.currentQuestion.id,
          question: state.currentQuestion.question,
          answer: action.payload.answer,
          timeSpent: action.payload.timeSpent,
          timestamp: new Date().toISOString(),
        };
        state.answers.push(newAnswer);
        state.lastSaved = new Date().toISOString();
      }
    },

    finishInterview: (state, action: PayloadAction<{
      totalScore: number;
      summary: string;
    }>) => {
      state.isActive = false;
      state.isFinished = true;
      state.totalScore = action.payload.totalScore;
      state.summary = action.payload.summary;
      state.currentQuestion = null;
      state.timeRemaining = 0;
      state.lastSaved = new Date().toISOString();
    },

    resumeInterview: (state, action: PayloadAction<{
      interviewId: string;
      candidateInfo: CandidateInfo;
      currentQuestion: Question;
      questionNumber: number;
      answeredQuestions: number;
    }>) => {
      const { interviewId, candidateInfo, currentQuestion, questionNumber } = action.payload;
      state.interviewId = interviewId;
      state.candidateInfo = candidateInfo;
      state.currentQuestion = currentQuestion;
      state.questionNumber = questionNumber;
      state.timeRemaining = currentQuestion.timeLimit;
      state.isActive = true;
      state.isFinished = false;
      state.lastSaved = new Date().toISOString();
    },

    pauseInterview: (state) => {
      state.isActive = false;
      state.lastSaved = new Date().toISOString();
    },

    resetInterview: (state) => {
      return { ...initialState };
    },
    
    setHasExistingInterview: (state, action: PayloadAction<boolean>) => {
      state.hasExistingInterview = action.payload;
    },

    setCandidateInfo: (state, action: PayloadAction<CandidateInfo>) => {
      state.candidateInfo = action.payload;
      state.lastSaved = new Date().toISOString();
    },
    
    setInterviewId: (state, action: PayloadAction<string>) => {
      state.interviewId = action.payload;
    },
    
    addAnswer: (state, action: PayloadAction<Answer>) => {
      state.answers.push(action.payload);
    },
    
    setResults: (state, action: PayloadAction<InterviewResults>) => {
      state.results = action.payload;
      state.isFinished = true;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  startInterview,
  setCurrentQuestion,
  updateTimeRemaining,
  submitAnswer,
  finishInterview,
  resumeInterview,
  pauseInterview,
  resetInterview,
  setCandidateInfo,
  setInterviewId,
  addAnswer,
  setResults,
  setLoading,
  setError,
  setHasExistingInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;