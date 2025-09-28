'use client';

import React, { useState } from 'react';
import { Question } from '@/lib/slices/interviewSlice';
import { Button } from '@/components/ui/button';
import { Timer } from '@/components/Timer';
import { Send, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string, timeSpent: number) => void;
  onSubmitQuiz?: () => void;
  isActive: boolean;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
  onSubmitQuiz,
  isActive,
  disabled = false,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);

  const handleSubmit = () => {
    const actualTimeSpent = question.timeLimit - timeSpent;
    onSubmitAnswer(answer, actualTimeSpent);
    setAnswer('');
  };

  const handleTimeUp = () => {
    const actualTimeSpent = question.timeLimit;
    onSubmitAnswer(answer, actualTimeSpent);
  };

  const handleTimeUpdate = (timeRemaining: number) => {
    setTimeSpent(timeRemaining);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">
              Question {questionNumber} of {totalQuestions}
            </h2>
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium border',
              getDifficultyColor(question.difficulty)
            )}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {question.timeLimit}s limit
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
        <Timer
          timeLimit={question.timeLimit}
          isActive={isActive && !disabled}
          onTimeUp={handleTimeUp}
          onTimeUpdate={handleTimeUpdate}
          questionId={question.id}
        />
      </div>

      {/* Question */}
      <div className="px-6 py-6">
        <div className="flex items-start space-x-3 mb-6">
          <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
            <Lightbulb className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Interview Question
            </h3>
            <p className="text-gray-700 leading-relaxed text-base">
              {question.question}
            </p>
          </div>
        </div>

        {/* Answer Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={disabled}
              placeholder="Type your answer here..."
              className={cn(
                'w-full min-h-[150px] p-4 border border-gray-300 rounded-lg resize-vertical',
                'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'disabled:bg-gray-100 disabled:cursor-not-allowed',
                'text-base leading-relaxed'
              )}
              rows={6}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {answer.length} characters
            </div>
            
            <div className="flex items-center gap-3">
              {onSubmitQuiz && (
                <Button
                  variant="outline"
                  onClick={onSubmitQuiz}
                  disabled={disabled}
                  className="px-6 py-2"
                >
                  Finish Interview
                </Button>
              )}
              
              <Button
                onClick={handleSubmit}
                disabled={disabled || !isActive}
                className="px-6 py-2 min-w-[120px]"
              >
                <Send className="h-4 w-4 mr-2" />
                {disabled ? 'Submitted' : 'Submit Answer'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}