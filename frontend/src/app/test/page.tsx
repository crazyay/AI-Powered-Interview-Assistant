'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, FileText, ChevronRight, Sparkles, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestHomePage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<'custom' | 'resume' | null>(null);

  const handleModeSelect = (mode: 'custom' | 'resume') => {
    setSelectedMode(mode);
    // Navigate to appropriate page based on mode
    if (mode === 'custom') {
      router.push('/test/custom');
    } else {
      router.push('/test/resume');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Knowledge Test Platform</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test your technical knowledge instantly with AI-powered assessments. Choose your preferred test mode below.
          </p>
        </div>

        {/* Test Mode Selection Cards */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mt-16">
          {/* Custom Test Card */}
          <Card 
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2",
              selectedMode === 'custom' ? 'border-blue-500 shadow-xl' : 'border-gray-200'
            )}
            onClick={() => handleModeSelect('custom')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center">
                <Target className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Create Custom Test</CardTitle>
              <CardDescription className="text-base">
                Choose your topics and customize the difficulty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Select from multiple technical topics</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Choose number of questions (default: 20)</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Multiple choice questions</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Instant scoring and feedback</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Start Custom Test
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Resume-Based Test Card */}
          <Card 
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2",
              selectedMode === 'resume' ? 'border-purple-500 shadow-xl' : 'border-gray-200'
            )}
            onClick={() => handleModeSelect('resume')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center">
                <FileText className="h-10 w-10 text-purple-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Resume-Based Test</CardTitle>
              <CardDescription className="text-base">
                Upload your resume for personalized questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Upload PDF or DOCX resume</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">AI extracts your information</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Get questions based on your experience</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Personalized difficulty level</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                Start Resume Test
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Take Our Tests?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-lg mb-2">Instant Results</h3>
              <p className="text-gray-600 text-sm">Get your score and detailed feedback immediately after completion</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-lg mb-2">Targeted Questions</h3>
              <p className="text-gray-600 text-sm">AI-generated questions tailored to your skill level and preferences</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold text-lg mb-2">Detailed Analytics</h3>
              <p className="text-gray-600 text-sm">See which questions you got right or wrong with explanations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
