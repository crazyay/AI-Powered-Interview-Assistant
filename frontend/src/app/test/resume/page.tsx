'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Upload, FileText, Loader, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResumeTestPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeParsed, setResumeParsed] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: '',
    phone: '',
    resumeText: ''
  });
  const [questionCount, setQuestionCount] = useState(20);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await handleResumeUpload(selectedFile);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setUploading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_URL}/resume/parse`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.candidateInfo) {
        setCandidateInfo({
          name: data.candidateInfo.name || '',
          email: data.candidateInfo.email || '',
          phone: data.candidateInfo.phone || '',
          resumeText: data.candidateInfo.resumeText || ''
        });
        setResumeParsed(true);
      } else {
        setErrors({ upload: 'Failed to parse resume. Please fill in your details manually.' });
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      setErrors({ upload: 'Failed to upload resume. Please try again.' });
    } finally {
      setUploading(false);
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
    
    if (questionCount < 5 || questionCount > 50) {
      newErrors.questionCount = 'Questions must be between 5 and 50';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartTest = () => {
    if (validateForm()) {
      // Store test configuration in localStorage
      localStorage.setItem('testConfig', JSON.stringify({
        mode: 'resume',
        topics: [],
        questionCount,
        candidateInfo
      }));
      router.push('/test/start');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-10 w-10 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Resume-Based Test</h1>
          </div>
          <p className="text-gray-600">Upload your resume for personalized AI-generated questions</p>
        </div>

        <div className="space-y-6">
          {/* Resume Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>Upload your PDF or DOCX resume to auto-fill your information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                  disabled={uploading}
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader className="h-12 w-12 text-purple-600 animate-spin mb-4" />
                      <p className="text-gray-600">Parsing your resume...</p>
                    </div>
                  ) : resumeParsed ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                      <p className="text-gray-900 font-medium mb-2">Resume Uploaded Successfully!</p>
                      <p className="text-sm text-gray-600">{file?.name}</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Upload Different Resume
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-900 font-medium mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">PDF or DOCX (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.upload && (
                <p className="text-red-500 text-sm mt-2">{errors.upload}</p>
              )}
            </CardContent>
          </Card>

          {/* Candidate Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                {resumeParsed ? 'Review and edit your information' : 'Or enter your details manually'}
              </CardDescription>
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
                Default: 20 questions • 1 mark each • Personalized based on your resume
              </p>
            </CardContent>
          </Card>

          {/* Start Test Button */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Ready to begin?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {questionCount} personalized questions • {questionCount} marks total
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleStartTest}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!candidateInfo.name || !candidateInfo.email || !candidateInfo.phone}
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
