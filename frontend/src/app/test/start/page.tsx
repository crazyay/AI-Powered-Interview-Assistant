'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ChevronRight, Check, AlertCircle, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: number;
  difficulty: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Answer {
  questionId: number;
  question: string;
  selectedOption: number;
  correctAnswer: number;
  score: number;
}

export default function TestStartPage() {
  const router = useRouter();
  const [testConfig, setTestConfig] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Load test configuration from localStorage
    const config = localStorage.getItem('testConfig');
    if (config) {
      const parsedConfig = JSON.parse(config);
      setTestConfig(parsedConfig);
      startTest(parsedConfig);
    } else {
      router.push('/test');
    }
  }, []);

  const startTest = async (config: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateInfo: config.candidateInfo,
          testMode: config.mode,
          topics: config.topics || [],
          questionCount: config.questionCount || 20
        }),
      });

      const data = await response.json();

      if (data.success) {
        setInterviewId(data.interviewId);
        // Fetch all questions
        const questionsResponse = await fetch(`${API_URL}/interview/${data.interviewId}/questions`);
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData.questions || [data.firstQuestion]);
      } else {
        setError(data.error || 'Failed to start test');
      }
    } catch (err) {
      console.error('Error starting test:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedOption === null) return;

    setSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];

    try {
      const response = await fetch(`${API_URL}/interview/${interviewId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedOption: selectedOption
        }),
      });

      const data = await response.json();

      // Store answer with score from backend
      const answer: Answer = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        selectedOption: selectedOption,
        correctAnswer: currentQuestion.correctAnswer,
        score: data.score !== undefined ? data.score : (data.answerScore !== undefined ? data.answerScore : 0)
      };
      
      // Create updated answers array
      const updatedAnswers = [...answers, answer];
      setAnswers(updatedAnswers);
      
      console.log(`📝 Answer submitted for Q${currentQuestionIndex + 1}`);
      console.log(`   Score received: ${answer.score}`);
      console.log(`   Total answers collected: ${updatedAnswers.length}/${questions.length}`);

      if (data.finished) {
        console.log(`✅ Test finished! Saving ${updatedAnswers.length} answers`);
        // Store results and navigate to results page
        localStorage.setItem('testResults', JSON.stringify({
          answers: updatedAnswers,
          totalScore: data.totalScore,
          summary: data.summary,
          totalQuestions: questions.length
        }));
        router.push('/test/results');
      } else {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTest = async () => {
    if (selectedOption !== null) {
      await handleNextQuestion();
    } else {
      // Submit test without answer for current question
      try {
        const response = await fetch(`${API_URL}/interview/${interviewId}/finish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        localStorage.setItem('testResults', JSON.stringify({
          answers: answers,
          totalScore: data.totalScore,
          summary: data.summary,
          totalQuestions: questions.length
        }));
        router.push('/test/results');
      } catch (err) {
        console.error('Error finishing test:', err);
        setError('Failed to finish test');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Generating your test...</p>
            <p className="text-sm text-gray-600 mt-2">AI is creating personalized questions</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Error</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/test')}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Knowledge Test</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Answered</p>
            <p className="text-2xl font-bold text-blue-600">{answers.length}/{questions.length}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl flex-1">{currentQuestion?.question}</CardTitle>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium ml-4",
                currentQuestion?.difficulty === 'easy' && "bg-green-100 text-green-700",
                currentQuestion?.difficulty === 'medium' && "bg-yellow-100 text-yellow-700",
                currentQuestion?.difficulty === 'hard' && "bg-red-100 text-red-700"
              )}>
                {currentQuestion?.difficulty}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all",
                    selectedOption === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3",
                      selectedOption === index
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    )}>
                      {selectedOption === index && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-700 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleSubmitTest}
            disabled={submitting}
          >
            Submit Test Early
          </Button>
          
          <Button
            onClick={currentQuestionIndex === questions.length - 1 ? handleSubmitTest : handleNextQuestion}
            disabled={selectedOption === null || submitting}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : currentQuestionIndex === questions.length - 1 ? (
              'Submit Test'
            ) : (
              <>
                Next Question
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
