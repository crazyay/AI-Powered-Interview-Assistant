'use client';

import React from 'react';
import { Trophy, Clock, Target, CheckCircle2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, getScoreColor, getScoreBadgeClass } from '@/lib/utils';
import { CandidateInfo, Answer } from '@/types';

interface InterviewResultsProps {
  candidateInfo: CandidateInfo;
  totalScore: number;
  summary: string;
  answers: Answer[];
  onRestart: () => void;
  onViewDashboard: () => void;
}

export const InterviewResults: React.FC<InterviewResultsProps> = ({
  candidateInfo,
  totalScore,
  summary,
  answers,
  onRestart,
  onViewDashboard,
}) => {
  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', icon: Trophy, color: 'text-green-600' };
    if (score >= 60) return { level: 'Good', icon: Target, color: 'text-yellow-600' };
    return { level: 'Needs Improvement', icon: Clock, color: 'text-red-600' };
  };

  const performance = getPerformanceLevel(totalScore);
  const PerformanceIcon = performance.icon;

  const totalTimeSpent = answers.reduce((total, answer) => total + answer.timeSpent, 0);
  const averageScore = Math.round(answers.reduce((total, answer) => total + answer.score, 0) / answers.length);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Interview Completed!</CardTitle>
          <CardDescription className="text-lg">
            Thank you, {candidateInfo.name}. Here are your results.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>
                {totalScore}%
              </div>
              <Badge className={getScoreBadgeClass(totalScore)}>
                {performance.level}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <PerformanceIcon className={`w-4 h-4 ${performance.color}`} />
              Performance Level
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Questions Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {answers.length}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              All questions completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Time Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">
              {Math.round(totalTimeSpent / 60)}<span className="text-lg">m</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Total interview time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            AI Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Question-by-Question Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>
            Your performance on each question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <div key={answer.questionId} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">
                      Question {index + 1}
                    </h4>
                    <p className="font-medium">{answer.question}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getScoreBadgeClass(answer.score)}>
                      {answer.score}%
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded p-3 mb-2">
                  <p className="text-sm font-medium text-gray-600 mb-1">Your Answer:</p>
                  <p className="text-gray-700">{answer.answer || 'No answer provided'}</p>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Time spent: {Math.round(answer.timeSpent)}s</span>
                  <span>Answered at {formatDate(answer.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onRestart} variant="outline" size="lg">
              Take Another Interview
            </Button>
            <Button onClick={onViewDashboard} size="lg">
              View All Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};