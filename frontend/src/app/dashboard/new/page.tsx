'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, Plus } from 'lucide-react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { CandidatesTable } from '@/components/dashboard/CandidatesTable';
import { useCandidates, useAnalytics } from '@/hooks/useApi';

export default function DashboardPage() {
  const { 
    candidates, 
    loading: candidatesLoading, 
    error: candidatesError, 
    fetchCandidates, 
    deleteCandidate 
  } = useCandidates();
  
  const { 
    stats, 
    loading: statsLoading, 
    refetch: refetchStats 
  } = useAnalytics();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('totalScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchCandidates({
      search: searchQuery,
      sortBy,
      order: sortOrder,
    });
  }, [searchQuery, sortBy, sortOrder]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      const result = await deleteCandidate(candidateId);
      if (result.success) {
        refetchStats(); // Refresh stats after deletion
      } else {
        alert(result.error || 'Failed to delete candidate');
      }
    }
  };

  const handleViewCandidate = (candidateId: string) => {
    window.open(`/dashboard/candidates/${candidateId}`, '_blank');
  };

  const handleRefresh = () => {
    fetchCandidates({
      search: searchQuery,
      sortBy,
      order: sortOrder,
    });
    refetchStats();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Interview Dashboard</h1>
                <p className="text-gray-600">Monitor and manage candidate interviews</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => window.open('/', '_blank')}>
                <Plus className="h-4 w-4 mr-2" />
                New Interview
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {candidatesError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{candidatesError}</p>
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={statsLoading} />

        {/* Candidates Table */}
        <CandidatesTable
          candidates={candidates}
          loading={candidatesLoading}
          onSearch={handleSearch}
          onSort={handleSort}
          onDelete={handleDeleteCandidate}
          onView={handleViewCandidate}
        />
      </main>
    </div>
  );
}