'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { 
  setCandidateInfo, 
  setCurrentQuestion,
  setInterviewId,
  addAnswer, 
  setResults,
  resetInterview, 
  setLoading,
  setError,
  setHasExistingInterview
} from '@/lib/slices/interviewSlice';
import { apiService } from '@/lib/apiService';
import { ResumeUploader } from '@/components/interview/ResumeUploader';
import { QuestionCard } from '@/components/interview/QuestionCard';
import { InterviewResults } from '@/components/interview/InterviewResults';
import { Countdown } from '@/components/interview/Countdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader, Brain, Users, Clock, Award, Play, RotateCcw } from 'lucide-react';
import { useHealthCheck } from '@/hooks/useApi';

const INTERVIEW_STEPS = {
  WELCOME: 'welcome',
  CANDIDATE_INFO: 'candidate_info', 
  INTERVIEW: 'interview',
  RESULTS: 'results'
};

export default function InterviewApp() {
  const dispatch = useDispatch();
  const { 
    candidateInfo, 
    currentQuestion, 
    interviewId, 
    answers, 
    results, 
    loading, 
    error,
    hasExistingInterview 
  } = useSelector((state: RootState) => state.interview);

  const [currentStep, setCurrentStep] = useState(INTERVIEW_STEPS.WELCOME);
  const [showCountdown, setShowCountdown] = useState(false);
  const [hasCheckedExistingInterview, setHasCheckedExistingInterview] = useState(false);
  const { isHealthy, loading: healthLoading } = useHealthCheck();

  useEffect(() => {
    // Check for existing interview only once when component mounts
    if (!hasCheckedExistingInterview) {
      setHasCheckedExistingInterview(true);
      
      // Check if there's a real incomplete interview
      const hasIncompleteInterview = interviewId && !results && candidateInfo;
      
      if (hasIncompleteInterview) {
        // Keep the welcome step to show the resume/continue options
        setCurrentStep(INTERVIEW_STEPS.WELCOME);
      } else if (candidateInfo && candidateInfo.name && candidateInfo.email && candidateInfo.phone) {
        setCurrentStep(INTERVIEW_STEPS.CANDIDATE_INFO);
      } else {
        // Start fresh - go to welcome screen
        setCurrentStep(INTERVIEW_STEPS.WELCOME);
      }
    }
  }, [hasCheckedExistingInterview, interviewId, results, candidateInfo]);

  const handleCandidateInfoSubmit = (info: any) => {
    dispatch(setCandidateInfo(info));
    // Auto-advance to interview ready state when all info is filled
    if (info.name && info.email && info.phone) {
      setCurrentStep(INTERVIEW_STEPS.CANDIDATE_INFO);
    }
  };

  const handleStartInterview = async () => {
    if (!candidateInfo || !candidateInfo.name || !candidateInfo.email || !candidateInfo.phone) {
      dispatch(setError('Please fill in all required information'));
      return;
    }

    // Show countdown before starting interview
    setShowCountdown(true);
  };

  const handleCountdownComplete = async () => {
    setShowCountdown(false);
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await apiService.startInterview(candidateInfo!);
      
      if (response.data.success && response.data.interviewId) {
        dispatch(setInterviewId(response.data.interviewId));
        dispatch(setCurrentQuestion({ question: response.data.firstQuestion, questionNumber: 1 }));
        setCurrentStep(INTERVIEW_STEPS.INTERVIEW);
      } else {
        dispatch(setError('Failed to start interview'));
      }
    } catch (error: any) {
      dispatch(setError(error.response?.data?.error || 'Failed to start interview'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAnswerSubmit = async (answer: string, timeSpent: number) => {
    if (!interviewId) return;

    dispatch(setLoading(true));

    try {
      const response = await apiService.submitAnswer(interviewId, answer, timeSpent);

      dispatch(addAnswer({
        questionId: currentQuestion?.id || 0,
        question: currentQuestion?.question || '',
        answer,
        timeSpent,
        score: 0, // Will be updated with actual score
        timestamp: new Date().toISOString()
      }));

      if (response.data.finished) {
        // Interview completed
        const resultsResponse = await apiService.getInterviewResults(interviewId);
        dispatch(setResults(resultsResponse.data));
        setCurrentStep(INTERVIEW_STEPS.RESULTS);
      } else if (response.data.nextQuestion) {
        // More questions available
        // Get current question number and increment
        const nextQuestionNumber = (currentQuestion?.id || 0) + 1;
        dispatch(setCurrentQuestion({ question: response.data.nextQuestion, questionNumber: nextQuestionNumber }));
      }
    } catch (error: any) {
      dispatch(setError(error.response?.data?.error || 'Failed to submit answer'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleResumeInterview = async () => {
    if (!interviewId) return;

    try {
      const response = await apiService.getCurrentQuestion(interviewId);
      if (response.data.question) {
        dispatch(setCurrentQuestion({ question: response.data.question, questionNumber: response.data.questionNumber || 1 }));
        setCurrentStep(INTERVIEW_STEPS.INTERVIEW);
      }
    } catch (error: any) {
      dispatch(setError(error.response?.data?.error || 'Failed to resume interview'));
    }
  };

  const handleRestartInterview = () => {
    dispatch(resetInterview());
    setHasCheckedExistingInterview(false);
    setCurrentStep(INTERVIEW_STEPS.CANDIDATE_INFO);
  };

  const handleViewDashboard = () => {
    window.open('/dashboard', '_blank');
  };

  const handleSubmitQuiz = async () => {
    if (!interviewId) return;

    const confirmed = window.confirm(
      'Are you sure you want to finish the interview? This will submit your current progress and you cannot return to answer more questions.'
    );

    if (!confirmed) return;

    dispatch(setLoading(true));

    try {
      const response = await apiService.finishInterviewEarly(interviewId);
      
      if (response.data.success) {
        // Get final results
        const resultsResponse = await apiService.getInterviewResults(interviewId);
        dispatch(setResults(resultsResponse.data));
        setCurrentStep(INTERVIEW_STEPS.RESULTS);
      } else {
        dispatch(setError('Failed to submit interview'));
      }
    } catch (error: any) {
      dispatch(setError(error.response?.data?.error || 'Failed to submit interview'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (!isHealthy && !healthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl">Server Unavailable</CardTitle>
            <CardDescription>
              Unable to connect to the interview server. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (healthLoading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Connecting to server...</p>
          </div>
        </div>
        
        {showCountdown && (
          <Countdown onComplete={handleCountdownComplete} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI Interview Assistant</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Server Online</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/dashboard', '_blank')}
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => dispatch(setError(null))}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        )}

        {currentStep === INTERVIEW_STEPS.WELCOME && (
          <div className="max-w-4xl mx-auto">
            {(interviewId && !results && candidateInfo) ? (
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                  <CardDescription>
                    You have an incomplete interview. Would you like to continue or start fresh?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleResumeInterview} className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Resume Interview
                    </Button>
                    <Button onClick={handleRestartInterview} variant="outline" className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Start New Interview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center space-y-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to AI-Powered Interview
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Experience the future of technical interviews with our AI-driven assessment platform. 
                    Get real-time scoring, personalized feedback, and comprehensive performance analysis.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 my-12">
                  <Card className="text-center">
                    <CardHeader>
                      <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <CardTitle>Smart Assessment</CardTitle>
                      <CardDescription>AI-powered questions tailored to your experience level</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="text-center">
                    <CardHeader>
                      <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <CardTitle>Real-time Feedback</CardTitle>
                      <CardDescription>Instant scoring and performance insights</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="text-center">
                    <CardHeader>
                      <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <CardTitle>Detailed Analytics</CardTitle>
                      <CardDescription>Comprehensive performance reports and recommendations</CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                <Button 
                  size="lg"
                  onClick={() => setCurrentStep(INTERVIEW_STEPS.CANDIDATE_INFO)}
                  className="px-8 py-3 text-lg"
                >
                  Start Your Interview
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === INTERVIEW_STEPS.CANDIDATE_INFO && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's Get Started</h2>
              <p className="text-gray-600">
                Please provide your information to begin the interview process
              </p>
            </div>

            <ResumeUploader 
              onCandidateInfo={handleCandidateInfoSubmit}
              initialInfo={candidateInfo || undefined}
            />

            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                onClick={handleStartInterview}
                disabled={!candidateInfo || !candidateInfo.name || !candidateInfo.email || !candidateInfo.phone || loading}
                className="px-8"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Starting Interview...</span>
                  </span>
                ) : (
                  'Begin Interview'
                )}
              </Button>
            </div>
          </div>
        )}

        {currentStep === INTERVIEW_STEPS.INTERVIEW && currentQuestion && (
          <div className="max-w-4xl mx-auto">
            <QuestionCard
              key={`question-${currentQuestion.id}-${currentQuestion.timeLimit}`}
              question={currentQuestion}
              questionNumber={answers.length + 1}
              totalQuestions={6} // This should come from the API
              onSubmit={handleAnswerSubmit}
              onSubmitQuiz={handleSubmitQuiz}
              loading={loading}
            />
          </div>
        )}

        {currentStep === INTERVIEW_STEPS.RESULTS && results && (
          <div className="max-w-6xl mx-auto">
            <InterviewResults
              candidateInfo={candidateInfo!}
              totalScore={results.totalScore || 0}
              summary={results.summary || ''}
              answers={answers.map(answer => ({ ...answer, score: answer.score || 0 }))}
              onRestart={handleRestartInterview}
              onViewDashboard={handleViewDashboard}
            />
          </div>
        )}
      </main>
      
      {showCountdown && (
        <Countdown onComplete={handleCountdownComplete} />
      )}
    </div>
  );
}