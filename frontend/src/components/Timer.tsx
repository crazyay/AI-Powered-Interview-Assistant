'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TimerProps {
  timeLimit: number;
  isActive: boolean;
  onTimeUp: () => void;
  onTimeUpdate: (timeRemaining: number) => void;
  questionId?: number | string; // Add questionId to track question changes
  className?: string;
}

export function Timer({ timeLimit, isActive, onTimeUp, onTimeUpdate, questionId, className }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  // Reset timer when question changes or timeLimit changes
  useEffect(() => {
    console.log(`🔄 Timer resetting for question ${questionId} with ${timeLimit} seconds`);
    setTimeRemaining(timeLimit);
  }, [timeLimit, questionId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeRemaining > 0) {
      console.log(`⏱️ Starting timer interval for question ${questionId}`);
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          onTimeUpdate(newTime); 
          
          if (newTime <= 0) {
            console.log(`⏰ Timer finished for question ${questionId}`);
            onTimeUp();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        console.log(`🛑 Clearing timer interval for question ${questionId}`);
        clearInterval(interval);
      }
    };
  }, [isActive, questionId, onTimeUp, onTimeUpdate]); // Added questionId to restart timer on question change

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeRemaining / timeLimit) * 100;
  const isLowTime = timeRemaining <= timeLimit * 0.2; // 20% of total time
  const isCriticalTime = timeRemaining <= 10; // Last 10 seconds

  return (
    <div className={cn('w-full space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className={cn(
            'h-5 w-5',
            isCriticalTime ? 'text-red-500' : isLowTime ? 'text-orange-500' : 'text-blue-500'
          )} />
          <span className="font-medium text-gray-700">Time Remaining</span>
        </div>
        
        <div className={cn(
          'text-2xl font-bold tabular-nums',
          isCriticalTime ? 'text-red-500' : isLowTime ? 'text-orange-500' : 'text-blue-600'
        )}>
          {formatTime(timeRemaining)}
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={progressPercentage} 
          className={cn(
            'h-3',
            isCriticalTime && 'animate-pulse'
          )}
        />
        
        {isCriticalTime && (
          <div className="flex items-center justify-center space-x-2 text-red-600 animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Time running out!</span>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        {timeRemaining === 0 ? 'Time\'s up!' : `${timeLimit} seconds total`}
      </div>
    </div>
  );
}