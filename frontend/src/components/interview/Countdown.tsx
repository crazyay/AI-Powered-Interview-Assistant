'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  onComplete: () => void;
  duration?: number; // in seconds
}

export function Countdown({ onComplete, duration = 3 }: CountdownProps) {
  const [count, setCount] = useState(duration);
  const [showStart, setShowStart] = useState(false);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!showStart) {
      setShowStart(true);
      const startTimer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(startTimer);
    }
  }, [count, showStart, onComplete]);

  if (showStart) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 to-blue-900 flex items-center justify-center z-50">
        <div className="text-center animate-pulse">
          <div className="text-8xl font-bold text-green-400 mb-4 animate-bounce">START!</div>
          <div className="text-2xl text-white">Good luck with your interview!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className={`text-9xl font-bold text-white mb-6 transition-all duration-500 ${count <= 1 ? 'text-red-400 animate-pulse' : count <= 2 ? 'text-yellow-400' : 'text-blue-300'}`}>
          {count}
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-white/80 mb-4">
          <Clock className="h-8 w-8" />
          <span className="text-2xl">Interview starting in...</span>
        </div>
        
        <div className="text-lg text-gray-300">
          Prepare yourself for the questions
        </div>
        
        <div className="mt-8 w-64 mx-auto bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-1000" 
            style={{ width: `${((duration - count) / duration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}