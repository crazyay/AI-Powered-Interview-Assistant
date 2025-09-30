'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  startInterview,
  setCurrentQuestion,
  submitAnswer,
  finishInterview,
  resumeInterview,
  resetInterview,
  setCandidateInfo,
} from '@/lib/slices/interviewSlice';
import { FileUpload } from '@/components/FileUpload';
import { CandidateForm } from '@/components/CandidateForm';
import { QuestionCard } from '@/components/QuestionCard';
import { ResultsPage } from '@/components/ResultsPage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import * as api from '@/lib/api';
import { Brain, Users, Clock } from 'lucide-react';

enum InterviewStep {
  UPLOAD = 'upload',
  CANDIDATE_INFO = 'candidate_info',
  INTERVIEW = 'interview',
  RESULTS = 'results',
}

export default function Home() {
  const dispatch = useDispatch();
  const interview = useSelector((state: RootState) => (state as any).interview);
  const [step, setStep] = useState<InterviewStep>(InterviewStep.UPLOAD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [hasCheckedForExistingInterview, setHasCheckedForExistingInterview] = useState(false);
  const [missingFields, setMissingFields] = useState<{ name: boolean; email: boolean; phone: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState('interviewee');
  const [showConfirmLeaveInterview, setShowConfirmLeaveInterview] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Check if interview is in progress
  const isInterviewInProgress = () => {
    return interview?.interviewId && 
           interview?.isActive && 
           !interview?.isFinished && 
           (step === InterviewStep.INTERVIEW || step === InterviewStep.CANDIDATE_INFO);
  };

  // Handle tab navigation with confirmation if needed
  const handleTabNavigation = (tabName: string) => {
    if (isInterviewInProgress()) {
      setPendingNavigation(tabName);
      setShowConfirmLeaveInterview(true);
    } else {
      executeTabNavigation(tabName);
    }
  };

  // Execute the actual navigation
  const executeTabNavigation = (tabName: string) => {
    if (tabName === 'interviewee') {
      setActiveTab('interviewee');
      // Reset to resume upload page
      setStep(InterviewStep.UPLOAD);
      dispatch(resetInterview());
      setError(null);
      setMissingFields(null);
      console.log('Switched to Interviewee tab - reset to upload page');
    } else if (tabName === 'interviewer') {
      setActiveTab('interviewer');
      window.location.href = '/dashboard';
    }
  };

  // Handle confirmation dialog response
  const handleConfirmLeaveInterview = (confirm: boolean) => {
    setShowConfirmLeaveInterview(false);
    
    if (confirm && pendingNavigation) {
      executeTabNavigation(pendingNavigation);
    }
    
    setPendingNavigation(null);
  };

  // Check for existing interview on component mount (only once)
  useEffect(() => {
    if (!hasCheckedForExistingInterview) {
      setHasCheckedForExistingInterview(true);
      
      // Check if user has previously dismissed this dialog
      const hasUserDismissedDialog = localStorage.getItem('welcomeBackDismissed');
      
      if (interview?.interviewId && interview?.isActive && !interview?.isFinished) {
        // Only show dialog if user hasn't dismissed it before
        if (!hasUserDismissedDialog) {
          setShowWelcomeBack(true);
        }
      } else if (interview?.isFinished) {
        setStep(InterviewStep.RESULTS);
      } else if (interview?.candidateInfo && !interview?.interviewId) {
        setStep(InterviewStep.CANDIDATE_INFO);
      }
    }
  }, [hasCheckedForExistingInterview, interview?.interviewId, interview?.isActive, interview?.isFinished, interview?.candidateInfo]);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.parseResume(file);
      
      if (result.success && result.candidateInfo) {
        dispatch(setCandidateInfo(result.candidateInfo));
        setStep(InterviewStep.CANDIDATE_INFO);
      } else {
        setError(result.error || 'Failed to parse resume');
      }
    } catch (err) {
      setError('An unexpected error occurred while parsing the resume');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    console.log('Starting interview with candidateInfo:', interview?.candidateInfo);
    
    if (!interview?.candidateInfo) {
      console.error('No candidate info available');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMissingFields(null);
    // Clear the dialog dismissed flag since user is starting a new interview
    localStorage.removeItem('welcomeBackDismissed');

    try {
      const result = await api.startInterview(interview.candidateInfo);
      console.log('Start interview result:', result);
      
      if (result.success && result.interviewId && result.firstQuestion) {
        dispatch(startInterview({
          interviewId: result.interviewId,
          candidateInfo: interview.candidateInfo,
          firstQuestion: result.firstQuestion,
        }));
        setStep(InterviewStep.INTERVIEW);
      } else if (result.missing) {
        console.log('Missing fields detected:', result.missing);
        setMissingFields(result.missing);
      } else {
        console.error('Interview start failed:', result.error);
        setError(result.error || 'Failed to start interview');
      }
    } catch (err: any) {
      console.error('Interview start error:', err);
      setError('An unexpected error occurred while starting the interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answer: string, timeSpent: number) => {
    if (!interview?.interviewId) return;

    setLoading(true);
    
    try {
      dispatch(submitAnswer({ answer, timeSpent }));
      
      const result = await api.submitAnswer(interview.interviewId, answer, timeSpent);
      
      if (result.success) {
        if (result.finished) {
          dispatch(finishInterview({
            totalScore: result.score || 0,
            summary: result.summary || 'Interview completed.',
          }));
          setStep(InterviewStep.RESULTS);
        } else if (result.nextQuestion) {
          dispatch(setCurrentQuestion({
            question: result.nextQuestion,
            questionNumber: result.questionNumber || interview.questionNumber + 1,
          }));
        }
      } else {
        setError(result.error || 'Failed to submit answer');
      }
    } catch (err) {
      setError('An unexpected error occurred while submitting the answer');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeInterview = async () => {
    if (!interview?.interviewId) return;

    setLoading(true);
    
    try {
      const result = await api.resumeInterview(interview.interviewId);
      
      if (result.canResume && result.interview) {
        dispatch(resumeInterview({
          interviewId: result.interview.id,
          candidateInfo: result.interview.candidateInfo,
          currentQuestion: result.interview.currentQuestion,
          questionNumber: result.interview.questionNumber,
          answeredQuestions: result.interview.answeredQuestions,
        }));
        setStep(InterviewStep.INTERVIEW);
        setShowWelcomeBack(false);
      } else {
        setError(result.reason || 'Cannot resume interview');
        setShowWelcomeBack(false);
      }
    } catch (err) {
      setError('An unexpected error occurred while resuming the interview');
      setShowWelcomeBack(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRestartInterview = () => {
    dispatch(resetInterview());
    // Clear the dialog dismissed flag to allow showing dialog again in future
    localStorage.removeItem('welcomeBackDismissed');
    setStep(InterviewStep.UPLOAD);
    setError(null);
    setMissingFields(null);
    setShowWelcomeBack(false);
  };

  const handleSubmitQuiz = async () => {
    if (!interview?.interviewId) return;

    const confirmed = window.confirm(
      'Are you sure you want to finish the interview? This will submit your current progress and you cannot return to answer more questions.'
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await api.finishInterviewEarly(interview.interviewId);
      
      if (response.success) {
        // Get final results
        const resultsResponse = await api.getInterviewResults(interview.interviewId);
        if (resultsResponse && !resultsResponse.error) {
          dispatch(finishInterview({
            totalScore: resultsResponse.totalScore || 0,
            summary: resultsResponse.summary || 'Interview completed early.',
          }));
          setStep(InterviewStep.RESULTS);
        } else {
          setError(resultsResponse.error || 'Failed to get results');
        }
      } else {
        setError(response.error || 'Failed to submit interview');
      }
    } catch (error: any) {
      setError('Failed to submit interview');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case InterviewStep.UPLOAD:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI-Powered Interview Assistant
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Upload your resume to start an intelligent interview session with AI-generated questions
              </p>
            </div>
            
            <FileUpload
              onFileSelect={handleFileSelect}
              loading={loading}
              error={error || undefined}
            />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">6 AI Questions</h3>
                <p className="text-gray-600 text-sm">Tailored for Full Stack development</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Timed Responses</h3>
                <p className="text-gray-600 text-sm">20s, 60s, and 120s time limits</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">AI Scoring</h3>
                <p className="text-gray-600 text-sm">Intelligent assessment and feedback</p>
              </div>
            </div>
          </div>
        );

      case InterviewStep.CANDIDATE_INFO:
        return interview?.candidateInfo ? (
          <CandidateForm
            candidateInfo={interview.candidateInfo}
            onUpdate={(info) => {
              dispatch(setCandidateInfo(info));
              // Clear missing fields when info is updated
              setMissingFields(null);
              setError(null);
              console.log('Candidate info updated:', info);
            }}
            onStartInterview={handleStartInterview}
            missingFields={missingFields || undefined}
            loading={loading}
          />
        ) : null;

      case InterviewStep.INTERVIEW:
        return interview?.currentQuestion ? (
          <QuestionCard
            question={interview.currentQuestion}
            questionNumber={interview.questionNumber}
            totalQuestions={interview.totalQuestions}
            onSubmitAnswer={handleSubmitAnswer}
            onSubmitQuiz={handleSubmitQuiz}
            isActive={interview.isActive}
            disabled={loading}
          />
        ) : null;

      case InterviewStep.RESULTS:
        return <ResultsPage onRestartInterview={handleRestartInterview} />;

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-sm border-b mb-8">
          <div className="container mx-auto px-4">
            {/* Header Navigation */}
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">AI Interview Assistant</span>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="border-t border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleTabNavigation('interviewee')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${
                    activeTab === 'interviewee'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4 inline-block mr-2" />
                  Interviewee
                </button>
                <button
                  onClick={() => handleTabNavigation('interviewer')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${
                    activeTab === 'interviewer'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Brain className="w-4 h-4 inline-block mr-2" />
                  Interviewer
                </button>
              </nav>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          {/* Error Display */}
          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Main Content */}
          {renderStep()}
        </div>
      </div>

      {/* Confirm Leave Interview Modal */}
      <Dialog open={showConfirmLeaveInterview} onOpenChange={setShowConfirmLeaveInterview}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>⚠️ Interview in Progress</DialogTitle>
            <DialogDescription>
              You are currently in the middle of an interview. Leaving now will end your current session and you won't be able to resume from where you left off.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => handleConfirmLeaveInterview(false)}
              className="flex-1"
            >
              Stay in Interview
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleConfirmLeaveInterview(true)}
              className="flex-1"
            >
              End Interview & Leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Welcome Back Modal */}
      <Dialog open={showWelcomeBack} onOpenChange={setShowWelcomeBack}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>Welcome Back!</DialogTitle>
            <DialogDescription>
              You have an unfinished interview. Would you like to continue where you left off?
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowWelcomeBack(false);
                localStorage.setItem('welcomeBackDismissed', 'true');
                // Clear the existing interview data to start fresh
                dispatch(resetInterview());
              }}
              className="flex-1"
            >
              Start New
            </Button>
            <Button
              onClick={() => {
                handleResumeInterview();
                localStorage.setItem('welcomeBackDismissed', 'true');
              }}
              disabled={loading}
              className="flex-1"
            >
              Continue Interview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}