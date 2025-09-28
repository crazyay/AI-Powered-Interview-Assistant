import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalScore: number;
  summary: string;
  interviewId: string;
  lastInterview: string;
}

export interface CandidateState {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  sortBy: 'name' | 'totalScore' | 'lastInterview';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: CandidateState = {
  candidates: [],
  selectedCandidate: null,
  sortBy: 'totalScore',
  sortOrder: 'desc',
  searchQuery: '',
  loading: false,
  error: null,
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    setCandidates: (state, action: PayloadAction<Candidate[]>) => {
      state.candidates = action.payload;
      state.loading = false;
      state.error = null;
    },

    addCandidate: (state, action: PayloadAction<Candidate>) => {
      const existingIndex = state.candidates.findIndex(
        c => c.email === action.payload.email
      );
      
      if (existingIndex !== -1) {
        state.candidates[existingIndex] = action.payload;
      } else {
        state.candidates.push(action.payload);
      }
    },

    setSelectedCandidate: (state, action: PayloadAction<Candidate | null>) => {
      state.selectedCandidate = action.payload;
    },

    setSortBy: (state, action: PayloadAction<'name' | 'totalScore' | 'lastInterview'>) => {
      state.sortBy = action.payload;
    },

    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearCandidates: (state) => {
      state.candidates = [];
      state.selectedCandidate = null;
    },
  },
});

export const {
  setCandidates,
  addCandidate,
  setSelectedCandidate,
  setSortBy,
  setSortOrder,
  setSearchQuery,
  setLoading,
  setError,
  clearCandidates,
} = candidateSlice.actions;

export default candidateSlice.reducer;