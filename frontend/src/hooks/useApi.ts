import { useState, useEffect } from 'react';
import { apiService } from '@/lib/apiService';
import { Candidate, InterviewStats } from '@/types';

export const useHealthCheck = () => {
  const [isHealthy, setIsHealthy] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiService.health();
        setIsHealthy(true);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { isHealthy, loading };
};

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async (params?: {
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAllCandidates(params);
      setCandidates(response.data.candidates);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const deleteCandidate = async (candidateId: string) => {
    try {
      await apiService.deleteCandidate(candidateId);
      setCandidates(candidates.filter(c => c._id !== candidateId));
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to delete candidate' 
      };
    }
  };

  return {
    candidates,
    loading,
    error,
    fetchCandidates,
    deleteCandidate,
  };
};

export const useAnalytics = () => {
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [topCandidates, setTopCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAnalytics();
      setStats(response.data.stats);
      setTopCandidates(response.data.topCandidates);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    stats,
    topCandidates,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};