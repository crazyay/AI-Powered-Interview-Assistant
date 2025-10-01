import axios from 'axios';
import { CandidateInfo, QuestionResponse, SubmitAnswerResponse, Candidate, InterviewStats, Interview, Question, Answer } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-powered-interview-assistant-bfc9.onrender.com/api';
console.log(API_BASE_URL);
console.log(process.env.NEXT_PUBLIC_API_URL);
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume parsing
export const parseResume = async (file: File): Promise<{
  success: boolean;
  candidateInfo?: CandidateInfo;
  error?: string;
}> => {
  console.log(API_BASE_URL);

  const formData = new FormData();
  formData.append('resume', file);

  try {
    const response = await api.post('/resume/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error parsing resume:', error);
    return {
      success: false,
      error: axios.isAxiosError(error) 
        ? error.response?.data?.error || 'Failed to parse resume'
        : 'Network error',
    };
  }
};

// Interview management
export const startInterview = async (candidateInfo: CandidateInfo): Promise<{
  success: boolean;
  interviewId?: string;
  firstQuestion?: Question;
  error?: string;
  missing?: { name: boolean; email: boolean; phone: boolean };
}> => {
  try {
    const response = await api.post('/interview/start', { candidateInfo });
    return response.data;
  } catch (error) {
    console.error('Error starting interview:', error);
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to start interview'
        : 'Network error',
      missing: axios.isAxiosError(error) ? error.response?.data?.missing : undefined,
    };
  }
};

export const getCurrentQuestion = async (interviewId: string): Promise<{
  question?: Question;
  questionNumber?: number;
  totalQuestions?: number;
  finished: boolean;
  error?: string;
}> => {
  try {
    const response = await api.get(`/interview/${interviewId}/question`);
    return response.data;
  } catch (error) {
    console.error('Error getting question:', error);
    return {
      finished: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to get question'
        : 'Network error',
    };
  }
};

export const submitAnswer = async (
  interviewId: string,
  answer: string,
  timeSpent: number
): Promise<{
  success: boolean;
  finished: boolean;
  nextQuestion?: Question;
  questionNumber?: number;
  score?: number;
  summary?: string;
  error?: string;
}> => {
  try {
    const response = await api.post(`/interview/${interviewId}/answer`, {
      answer,
      timeSpent,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting answer:', error);
    return {
      success: false,
      finished: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to submit answer'
        : 'Network error',
    };
  }
};

export const getInterviewResults = async (interviewId: string): Promise<{
  candidateInfo?: CandidateInfo;
  totalScore?: number;
  summary?: string;
  answers?: Answer[];
  status?: string;
  error?: string;
}> => {
  try {
    const response = await api.get(`/interview/${interviewId}/results`);
    return response.data;
  } catch (error) {
    console.error('Error getting results:', error);
    return {
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to get results'
        : 'Network error',
    };
  }
};

export const finishInterviewEarly = async (interviewId: string): Promise<{
  success: boolean;
  message?: string;
  totalScore?: number;
  summary?: string;
  error?: string;
}> => {
  try {
    const response = await api.post(`/interview/${interviewId}/finish`);
    return response.data;
  } catch (error) {
    console.error('Error finishing interview:', error);
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to finish interview'
        : 'Network error',
    };
  }
};

export const resumeInterview = async (interviewId: string): Promise<{
  canResume: boolean;
  reason?: string;
  interview?: {
    id: string;
    candidateInfo: CandidateInfo;
    currentQuestion: Question;
    questionNumber: number;
    totalQuestions: number;
    answeredQuestions: number;
  };
  error?: string;
}> => {
  try {
    const response = await api.get(`/interview/${interviewId}/resume`);
    return response.data;
  } catch (error) {
    console.error('Error resuming interview:', error);
    return {
      canResume: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to resume interview'
        : 'Network error',
    };
  }
};

// Dashboard API
export const getCandidates = async (
  sortBy = 'totalScore',
  order = 'desc',
  search = ''
): Promise<{
  candidates: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    totalScore: number;
    summary: string;
    interviewId: string;
    lastInterview: string;
  }>;
  error?: string;
}> => {
  try {
    const response = await api.get('/dashboard/candidates', {
      params: { sortBy, order, search },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting candidates:', error);
    return {
      candidates: [],
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to get candidates'
        : 'Network error',
    };
  }
};

export const getCandidateDetails = async (candidateId: string): Promise<{
  candidate?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalScore: number; 
    summary: string;
    interviewId: string;
    lastInterview: string;
  };
  interview?: {
    questions: Question[];
    answers: Answer[];
    startTime: string;
    endTime: string;
  };
  error?: string;
}> => {
  try {
    const response = await api.get(`/dashboard/candidates/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting candidate details:', error);
    return {
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to get candidate details'
        : 'Network error',
    };
  }
};

// Health check
export const checkHealth = async (): Promise<{ status: string; message: string }> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'ERROR', message: 'Backend not available' };
  }
};