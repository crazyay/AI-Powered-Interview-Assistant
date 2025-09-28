'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  setCandidates,
  setSelectedCandidate,
  setSortBy,
  setSortOrder,
  setSearchQuery,
  setLoading,
  setError,
} from '@/lib/slices/candidateSlice';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as api from '@/lib/api';
import {
  Brain,
  Search,
  ArrowUpDown,
  Users,
  Trophy,
  Clock,
  Mail,
  Phone,
  ChevronDown,
  Home,
  User,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const dispatch = useDispatch();
  const candidates = useSelector((state: RootState) => (state as any).candidate);
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load candidates on component mount
  useEffect(() => {
    loadCandidates();
  }, [candidates?.sortBy, candidates?.sortOrder, candidates?.searchQuery]);

  const loadCandidates = async () => {
    dispatch(setLoading(true));
    
    try {
      const result = await api.getCandidates(
        candidates?.sortBy || 'totalScore',
        candidates?.sortOrder || 'desc',
        candidates?.searchQuery || ''
      );
      
      if (result.candidates) {
        dispatch(setCandidates(result.candidates));
      } else if (result.error) {
        dispatch(setError(result.error));
      }
    } catch (err) {
      dispatch(setError('Failed to load candidates'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleViewDetails = async (candidateId: string) => {
    setLoadingDetails(true);
    setShowDetails(true);
    
    try {
      const result = await api.getCandidateDetails(candidateId);
      
      if (result.candidate) {
        setSelectedCandidateDetails(result);
        dispatch(setSelectedCandidate(result.candidate));
      } else if (result.error) {
        dispatch(setError(result.error));
        setShowDetails(false);
      }
    } catch (err) {
      dispatch(setError('Failed to load candidate details'));
      setShowDetails(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSort = (field: 'name' | 'totalScore' | 'lastInterview') => {
    if (candidates?.sortBy === field) {
      dispatch(setSortOrder(candidates.sortOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(field));
      dispatch(setSortOrder('desc'));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredCandidates = candidates?.candidates?.filter((candidate: any) =>
    candidate.name.toLowerCase().includes(candidates?.searchQuery?.toLowerCase() || '') ||
    candidate.email.toLowerCase().includes(candidates?.searchQuery?.toLowerCase() || '')
  ) || [];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-8 w-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Interview Dashboard</h1>
                </div>
                <div className="text-sm text-gray-500">
                  Interviewer Panel
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Interview
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Candidates</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {filteredCandidates.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Avg Score</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {filteredCandidates.length > 0
                      ? Math.round(filteredCandidates.reduce((sum: number, c: any) => sum + c.totalScore, 0) / filteredCandidates.length)
                      : 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">High Performers</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {filteredCandidates.filter((c: any) => c.totalScore >= 80).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Recent (Today)</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {filteredCandidates.filter((c: any) => 
                      new Date(c.lastInterview).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates by name or email..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={candidates?.searchQuery || ''}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-2"
                >
                  <span>Name</span>
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('totalScore')}
                  className="flex items-center space-x-2"
                >
                  <span>Score</span>
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('lastInterview')}
                  className="flex items-center space-x-2"
                >
                  <span>Date</span>
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Candidates</h2>
            </div>
            
            {candidates?.loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading candidates...</p>
              </div>
            ) : candidates?.error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{candidates.error}</p>
                <Button onClick={loadCandidates} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No candidates found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Candidates will appear here after completing interviews
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Summary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interview Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCandidates.map((candidate: any) => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {candidate.name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {candidate.email}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {candidate.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={cn(
                              'px-3 py-1 rounded-full text-sm font-medium',
                              getScoreColor(candidate.totalScore)
                            )}>
                              {candidate.totalScore}/100
                            </span>
                            <div className="ml-2 text-xs text-gray-500">
                              {getScoreLevel(candidate.totalScore)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {candidate.summary}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(candidate.lastInterview)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            size="sm"
                            onClick={() => handleViewDetails(candidate.id)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCandidateDetails?.candidate ? 
                `${selectedCandidateDetails.candidate.name} - Interview Details` : 
                'Candidate Details'
              }
            </DialogTitle>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading details...</p>
            </div>
          ) : selectedCandidateDetails ? (
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Candidate Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Name</span>
                    <p className="font-medium text-gray-900">{selectedCandidateDetails.candidate.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email</span>
                    <p className="font-medium text-gray-900">{selectedCandidateDetails.candidate.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone</span>
                    <p className="font-medium text-gray-900">{selectedCandidateDetails.candidate.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Final Score</span>
                    <p className={cn(
                      'font-bold text-lg',
                      selectedCandidateDetails.candidate.totalScore >= 80 ? 'text-green-600' :
                      selectedCandidateDetails.candidate.totalScore >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    )}>
                      {selectedCandidateDetails.candidate.totalScore}/100
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">AI Assessment Summary</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedCandidateDetails.candidate.summary}</p>
                </div>
              </div>

              {/* Interview Questions and Answers */}
              {selectedCandidateDetails.interview && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Interview History</h3>
                  <div className="space-y-4">
                    {selectedCandidateDetails.interview.answers?.map((answer: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-500">{answer.timeSpent}s</span>
                            {answer.score !== undefined && (
                              <span className={cn(
                                'font-medium',
                                answer.score >= 80 ? 'text-green-600' :
                                answer.score >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              )}>
                                {answer.score}/100
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3 font-medium">{answer.question}</p>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-gray-600 text-sm">
                            <strong>Answer:</strong> {answer.answer || 'No answer provided'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}