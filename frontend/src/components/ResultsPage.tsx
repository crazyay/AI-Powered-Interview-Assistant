'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Trophy, CheckCircle2, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultsPageProps {
  onRestartInterview: () => void;
}

export function ResultsPage({ onRestartInterview }: ResultsPageProps) {
  const { totalScore, summary, candidateInfo, answers } = useSelector((state: RootState) => state.interview);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Complete!</h1>
          <p className="text-gray-600 mt-2">Here are your results</p>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Score Section */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Final Score</h2>
                <p className="text-blue-100">Overall Interview Performance</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{totalScore}/100</div>
                <div className="text-blue-100">{getScoreLevel(totalScore || 0)}</div>
              </div>
            </div>
          </div>

          {/* Candidate Info */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Candidate Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-500">Name</span>
                <p className="font-medium text-gray-900">{candidateInfo?.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email</span>
                <p className="font-medium text-gray-900">{candidateInfo?.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Phone</span>
                <p className="font-medium text-gray-900">{candidateInfo?.phone}</p>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assessment Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="px-8 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Breakdown</h3>
            <div className="space-y-4">
              {answers?.map((answer, index) => (
                <div key={answer.questionId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{answer.timeSpent}s</span>
                      </div>
                      {answer.score !== undefined && (
                        <div className={`flex items-center space-x-2 ${getScoreColor(answer.score)}`}>
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="font-medium">{answer.score}/100</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{answer.question}</p>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-gray-600 text-sm">
                      <strong>Your Answer:</strong> {answer.answer || 'No answer provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onRestartInterview} variant="outline" size="lg">
                Take Another Interview
              </Button>
              <Button size="lg" onClick={() => window.location.href = '/dashboard'}>
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}