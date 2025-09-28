'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';
import { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (answer: string, timeSpent: number) => void;
  onSubmitQuiz?: () => void;
  loading?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  onSubmitQuiz,
  loading = false,
}) => {
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    // Reset all state when question changes
    console.log(`🔄 Question changed - Resetting timer for question ${question.id} with ${question.timeLimit} seconds`);
    
    setAnswer('');
    setTimeLeft(question.timeLimit);
    setTimeSpent(0);
    setIsTimeUp(false);

    // Start fresh timer for new question
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        setTimeSpent(question.timeLimit - newTime);
        
        if (newTime <= 0) {
          setIsTimeUp(true);
          clearInterval(timer);
          console.log(`⏰ Time up for question ${question.id}`);
          // Auto-submit when time is up
          setTimeout(() => {
            handleSubmit();
          }, 1000);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    console.log(`⏱️ Timer started for question ${question.id}`);

    return () => {
      console.log(`🛑 Cleaning up timer for question ${question.id}`);
      clearInterval(timer);
    };
  }, [question.id, question.timeLimit]); // More specific dependencies to ensure restart

  const handleSubmit = () => {
    const finalTimeSpent = question.timeLimit - timeLeft;
    onSubmit(answer, finalTimeSpent);
  };

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getTimeColor = () => {
    const percentage = (timeLeft / question.timeLimit) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">
              Question {questionNumber} of {totalQuestions}
            </CardTitle>
            <Badge variant={getDifficultyVariant(question.difficulty)}>
              {question.difficulty.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${getTimeColor()}`} />
            <span className={`font-mono text-lg font-bold ${getTimeColor()}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              timeLeft / question.timeLimit > 0.5 
                ? 'bg-green-500' 
                : timeLeft / question.timeLimit > 0.2 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`}
            style={{ width: `${(timeLeft / question.timeLimit) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 leading-relaxed">
            {question.question}
          </h3>
        </div>

        <div>
          <label htmlFor="answer" className="block text-sm font-medium mb-2">
            Your Answer:
          </label>
          <Textarea
            id="answer"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[120px]"
            disabled={isTimeUp || loading}
          />
        </div>

        {isTimeUp && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600 font-medium">
              Time's up! Your answer will be submitted automatically.
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600">
            Time spent: {formatTime(timeSpent)} / {formatTime(question.timeLimit)}
          </div>
          
          <div className="flex items-center gap-3">
            {onSubmitQuiz && (
              <Button 
                variant="outline"
                onClick={onSubmitQuiz}
                disabled={loading}
                className="px-6"
              >
                Finish Interview
              </Button>
            )}
            
            <Button 
              onClick={handleSubmit}
              disabled={isTimeUp || loading}
              className="px-8"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : isTimeUp ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Auto-submitting...
                </span>
              ) : (
                'Submit Answer'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};