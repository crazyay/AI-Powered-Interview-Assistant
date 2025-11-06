'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Plus, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const POPULAR_TOPICS = [
  'React',
  'Node.js',
  'JavaScript',
  'TypeScript',
  'MongoDB',
  'Express.js',
  'REST APIs',
  'HTML/CSS',
  'Git',
  'Docker',
  'SQL',
  'Python',
  'Java',
  'Data Structures',
  'Algorithms'
];

export default function CustomTestPage() {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!candidateInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!candidateInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateInfo.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!candidateInfo.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (selectedTopics.length === 0) {
      newErrors.topics = 'Please select at least one topic';
    }
    
    if (questionCount < 5 || questionCount > 50) {
      newErrors.questionCount = 'Questions must be between 5 and 50';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartTest = () => {
    if (validateForm()) {
      // Store test configuration in localStorage or Redux
      localStorage.setItem('testConfig', JSON.stringify({
        mode: 'custom',
        topics: selectedTopics,
        questionCount,
        candidateInfo
      }));
      router.push('/test/start');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Create Custom Test</h1>
          </div>
          <p className="text-gray-600">Select topics and configure your personalized knowledge test</p>
        </div>

        <div className="space-y-6">
          {/* Candidate Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Please provide your details to start the test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  placeholder="John Doe"
                  value={candidateInfo.name}
                  onChange={(e) => setCandidateInfo({ ...candidateInfo, name: e.target.value })}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={candidateInfo.email}
                  onChange={(e) => setCandidateInfo({ ...candidateInfo, email: e.target.value })}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={candidateInfo.phone}
                  onChange={(e) => setCandidateInfo({ ...candidateInfo, phone: e.target.value })}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Topic Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Select Topics</CardTitle>
              <CardDescription>
                Choose the topics you want to be tested on ({selectedTopics.length} selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TOPICS.map((topic) => (
                  <Button
                    key={topic}
                    type="button"
                    variant={selectedTopics.includes(topic) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      'transition-all',
                      selectedTopics.includes(topic) && 'bg-blue-600 hover:bg-blue-700'
                    )}
                  >
                    {topic}
                    {selectedTopics.includes(topic) && (
                      <X className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
              {errors.topics && <p className="text-red-500 text-sm mt-2">{errors.topics}</p>}
            </CardContent>
          </Card>

          {/* Question Count Card */}
          <Card>
            <CardHeader>
              <CardTitle>Number of Questions</CardTitle>
              <CardDescription>Choose how many questions you want (5-50)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Input
                  type="number"
                  min="5"
                  max="50"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 20)}
                  className={cn('w-32', errors.questionCount && 'border-red-500')}
                />
                <span className="text-gray-600">questions</span>
              </div>
              {errors.questionCount && (
                <p className="text-red-500 text-sm mt-2">{errors.questionCount}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Default: 20 questions • 1 mark each
              </p>
            </CardContent>
          </Card>

          {/* Start Test Button */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Ready to begin?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedTopics.length} topics • {questionCount} questions • {questionCount} marks
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleStartTest}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Test
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
