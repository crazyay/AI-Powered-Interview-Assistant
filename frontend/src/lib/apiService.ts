import axios from 'axios';
import { CandidateInfo, QuestionResponse, SubmitAnswerResponse, Candidate, InterviewStats, Interview, Question, Answer } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  health: () => api.get('/health'),

  // Test Gemini AI
  testGemini: () => api.get('/test-gemini'),

  // Resume operations
  parseResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    console.log('API: Parsing resume file:', file.name);
    const response = await api.post('/resume/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('API: Resume parse response:', response.data);
    return response;
  },

  // Interview operations
  startInterview: async (candidateInfo: CandidateInfo) => {
    console.log('API: Starting interview with:', candidateInfo);
    const response = await api.post('/interview/start', { candidateInfo });
    console.log('API: Start interview response:', response.data);
    return response.data;
  },

  getCurrentQuestion: (interviewId: string): Promise<{ data: QuestionResponse }> =>
    api.get(`/interview/${interviewId}/question`),

  submitAnswer: (
    interviewId: string,
    answer: string,
    timeSpent: number
  ): Promise<{ data: SubmitAnswerResponse }> =>
    api.post(`/interview/${interviewId}/answer`, { answer, timeSpent }),

  getInterviewResults: (interviewId: string) =>
    api.get(`/interview/${interviewId}/results`),

  resumeInterview: (interviewId: string) =>
    api.get(`/interview/${interviewId}/resume`),

  finishInterviewEarly: (interviewId: string) =>
    api.post(`/interview/${interviewId}/finish`),

  // Dashboard operations
  getAllCandidates: (params?: {
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ data: { candidates: Candidate[] } }> =>
    api.get('/dashboard/candidates', { params }),

  getCandidateDetails: (candidateId: string) =>
    api.get(`/dashboard/candidates/${candidateId}`),

  getAnalytics: (): Promise<{ data: { stats: InterviewStats; topCandidates: Candidate[] } }> =>
    api.get('/dashboard/analytics'),

  deleteCandidate: (candidateId: string) =>
    api.delete(`/dashboard/candidates/${candidateId}`),
};