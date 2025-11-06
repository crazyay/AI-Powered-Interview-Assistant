'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, XCircle, Home, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Answer {
  questionId: number;
  question: string;
  selectedOption: number;
  correctAnswer: number;
  score: number;
}

interface TestResults {
  answers: Answer[];
  totalScore: number;
  summary: string;
  totalQuestions: number;
}

export default function TestResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<TestResults | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    // Load results from localStorage
    const storedResults = localStorage.getItem('testResults');
    if (storedResults) {
      const parsedResults = JSON.parse(storedResults);
      
      // Debug: Log all answers and their scores
      console.log('📊 Results loaded:', {
        totalQuestions: parsedResults.totalQuestions,
        totalScore: parsedResults.totalScore,
        answersCount: parsedResults.answers.length
      });
      
      parsedResults.answers.forEach((ans: Answer, idx: number) => {
        console.log(`Q${idx + 1}: score=${ans.score}, selected=${ans.selectedOption}, correct=${ans.correctAnswer}`);
      });
      
      setResults(parsedResults);
    } else {
      router.push('/test');
    }
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

  const percentage = ((results.totalScore / results.totalQuestions) * 100).toFixed(1);
  const correctAnswers = results.answers.filter(a => a.score === 1).length;
  const wrongAnswers = results.totalQuestions - correctAnswers;
  
  console.log('📈 Stats calculated:', {
    total: results.totalQuestions,
    answersReceived: results.answers.length,
    correct: correctAnswers,
    wrong: wrongAnswers,
    totalScore: results.totalScore
  });

  const getScoreColor = () => {
    const score = parseFloat(percentage);
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = () => {
    const score = parseFloat(percentage);
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
          <p className="text-gray-600">Here are your detailed results</p>
        </div>

        {/* Score Card */}
        <Card className={cn("mb-8 border-2", getScoreBgColor())}>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Score</p>
                <p className={cn("text-5xl font-bold", getScoreColor())}>
                  {results.totalScore}/{results.totalQuestions}
                </p>
                <p className={cn("text-2xl font-semibold mt-1", getScoreColor())}>
                  {percentage}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <p className="text-4xl font-bold text-green-600">{correctAnswers}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Wrong Answers</p>
                <div className="flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600 mr-2" />
                  <p className="text-4xl font-bold text-red-600">{wrongAnswers}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        {results.summary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{results.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Detailed Answers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Answers</CardTitle>
            <CardDescription>Review each question and see where you went right or wrong</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.answers.map((answer, index) => {
                const isExpanded = expandedQuestion === answer.questionId;
                const isCorrect = answer.score === 1;

                return (
                  <div
                    key={answer.questionId}
                    className={cn(
                      "border-2 rounded-lg overflow-hidden transition-all",
                      isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    )}
                  >
                    <div
                      onClick={() => toggleQuestion(answer.questionId)}
                      className="p-4 cursor-pointer hover:opacity-80"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 mr-2" />
                            )}
                            <span className="font-semibold text-gray-700">
                              Question {index + 1}
                            </span>
                            <span className={cn(
                              "ml-3 px-2 py-1 rounded text-xs font-medium",
                              isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                              {isCorrect ? 'Correct' : 'Wrong'}
                            </span>
                          </div>
                          <p className="text-gray-900">{answer.question}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-500 ml-4" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500 ml-4" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-200">
                        <div className="mt-4 space-y-2">
                          <div className={cn(
                            "p-3 rounded-lg",
                            isCorrect ? "bg-green-100" : "bg-red-100"
                          )}>
                            <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                            <p className={cn(
                              "font-semibold",
                              isCorrect ? "text-green-700" : "text-red-700"
                            )}>
                              Option {String.fromCharCode(65 + answer.selectedOption)}
                            </p>
                          </div>

                          {!isCorrect && (
                            <div className="p-3 rounded-lg bg-green-100">
                              <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
                              <p className="font-semibold text-green-700">
                                Option {String.fromCharCode(65 + answer.correctAnswer)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              localStorage.removeItem('testConfig');
              localStorage.removeItem('testResults');
              router.push('/test');
            }}
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
          <Button
            size="lg"
            onClick={() => {
              localStorage.removeItem('testResults');
              router.push('/test');
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Take Another Test
          </Button>
        </div>
      </div>
    </div>
  );
}
