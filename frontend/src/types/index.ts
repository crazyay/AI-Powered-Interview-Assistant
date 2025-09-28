export interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
  resumeText?: string;
  skills?: string;
  experience?: string;
}

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
  score: number;
  timestamp: string;
}

export interface Interview {
  _id: string;
  candidateInfo: CandidateInfo;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  startTime: string;
  endTime?: string;
  status: 'in-progress' | 'completed' | 'abandoned' | 'error';
  totalScore?: number;
  summary?: string;
  duration?: number;
}

export interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalScore?: number;
  summary?: string;
  interviewId?: string;
  resumeText?: string;
  lastInterview: string;
  status: 'pending' | 'completed' | 'in-progress';
  createdAt: string;
  updatedAt: string;
}

export interface InterviewStats {
  totalInterviews: number;
  completedInterviews: number;
  inProgressInterviews: number;
  averageScore: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QuestionResponse {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  finished: boolean;
}

export interface SubmitAnswerResponse {
  success: boolean;
  finished: boolean;
  nextQuestion?: Question;
  questionNumber?: number;
  score?: number;
  summary?: string;
}