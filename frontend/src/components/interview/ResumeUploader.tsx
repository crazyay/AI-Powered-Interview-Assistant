'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/apiService';
import { CandidateInfo } from '@/types';

interface ResumeUploaderProps {
  onCandidateInfo: (info: CandidateInfo) => void;
  initialInfo?: CandidateInfo;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onCandidateInfo,
  initialInfo,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>(
    initialInfo || { name: '', email: '', phone: '' }
  );
  const [extractedInfo, setExtractedInfo] = useState<CandidateInfo | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.parseResume(file);
        console.log('Resume parse response:', response.data);
        
        const parsedInfo = response.data.candidateInfo;
        
        if (!parsedInfo) {
          console.error('No candidateInfo in response:', response.data);
          throw new Error('No candidate information extracted from resume');
        }
        
        console.log('Parsed candidate info:', parsedInfo);
        
        // Start auto-filling animation
        setIsAutoFilling(true);
        
        // Simulate typing animation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store extracted info and show verification
        setExtractedInfo(parsedInfo);
        
        // Ensure all fields are properly set with fallbacks
        const completeInfo = {
          name: parsedInfo.name?.trim() || '',
          email: parsedInfo.email?.trim() || '',
          phone: parsedInfo.phone?.trim() || '',
          resumeText: parsedInfo.resumeText || ''
        };
        
        console.log('Extracted info breakdown:', {
          originalParsedInfo: parsedInfo,
          completeInfo,
          hasName: !!completeInfo.name,
          hasEmail: !!completeInfo.email,
          hasPhone: !!completeInfo.phone
        });
        
        setCandidateInfo(completeInfo);
        setIsAutoFilling(false);
        setShowVerification(true);
        
        // Auto-fill the parent form with complete info - delay to ensure state update
        setTimeout(() => {
          onCandidateInfo(completeInfo);
          console.log('Parent form updated with:', completeInfo);
        }, 100);
        
        console.log('Resume parsed and auto-filled:', completeInfo);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to parse resume');
        setIsAutoFilling(false);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleInputChange = (field: keyof CandidateInfo, value: string) => {
    const updatedInfo = { ...candidateInfo, [field]: value };
    setCandidateInfo(updatedInfo);
    onCandidateInfo(updatedInfo);
    console.log(`Updated ${field}:`, value);
  };

  const isFormComplete = candidateInfo.name && candidateInfo.email && candidateInfo.phone;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Resume (Optional)
          </CardTitle>
          <CardDescription>
            Upload your resume in PDF or DOCX format to auto-fill your information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-gray-600">Processing resume...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-12 h-12 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? 'Drop the resume here...'
                    : 'Drag & drop your resume here, or click to select'}
                </p>
                <p className="text-xs text-gray-400">
                  Supports PDF and DOCX files up to 10MB
                </p>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="relative">
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
          <CardDescription>
            Fill in your details or they will be auto-populated from your resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={candidateInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={extractedInfo?.name && candidateInfo.name === extractedInfo.name ? 'ring-2 ring-green-200 bg-green-50' : ''}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={candidateInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={extractedInfo?.email && candidateInfo.email === extractedInfo.email ? 'ring-2 ring-green-200 bg-green-50' : ''}
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number *
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={candidateInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={extractedInfo?.phone && candidateInfo.phone === extractedInfo.phone ? 'ring-2 ring-green-200 bg-green-50' : ''}
              required
            />
          </div>
          
          <div>
            <label htmlFor="resumeText" className="block text-sm font-medium mb-1">
              Resume/Background (Optional)
            </label>
            <textarea
              id="resumeText"
              className="w-full p-3 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring min-h-[120px] resize-vertical bg-background"
              placeholder="Tell us about your experience, skills, and background... This will help generate more relevant interview questions."
              value={candidateInfo.resumeText || ''}
              onChange={(e) => handleInputChange('resumeText', e.target.value)}
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {(candidateInfo.resumeText || '').length}/2000 characters
            </div>
          </div>

          {/* Auto-filling Animation */}
          {isAutoFilling && (
            <div className="absolute inset-0 bg-blue-50/90 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-blue-600 mb-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg font-medium">Auto-filling form...</span>
                </div>
                <div className="text-sm text-blue-500">
                  Extracting information from your resume
                </div>
              </div>
            </div>
          )}

          {/* Verification Banner */}
          {showVerification && extractedInfo && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-green-800 font-medium">Resume parsed successfully!</span>
              </div>
              <div className="text-sm text-green-700">
                We've automatically filled in your information. Please review and verify the details below.
              </div>
              {extractedInfo.skills && (
                <div className="mt-2 text-xs text-green-600">
                  <strong>Detected skills:</strong> {extractedInfo.skills}
                </div>
              )}
            </div>
          )}

          <div className="pt-4">
            <div className={`text-sm ${isFormComplete ? 'text-green-600' : 'text-gray-500'}`}>
              {isFormComplete ? (
                <span className="flex items-center gap-1">
                  ✓ All required information provided
                  {candidateInfo.resumeText && <span className="text-blue-600">+ Resume background included</span>}
                </span>
              ) : (
                'Please fill in all required fields to continue'
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Verification Modal */}
      {showVerification && extractedInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Resume Parsed Successfully!</h3>
                  <p className="text-sm text-gray-600">Please verify your information below</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={candidateInfo.name}
                    onChange={(e) => setCandidateInfo({ ...candidateInfo, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={candidateInfo.email}
                    onChange={(e) => setCandidateInfo({ ...candidateInfo, email: e.target.value })}
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={candidateInfo.phone}
                    onChange={(e) => setCandidateInfo({ ...candidateInfo, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowVerification(false);
                    setExtractedInfo(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (candidateInfo.name && candidateInfo.email && candidateInfo.phone) {
                      onCandidateInfo(candidateInfo);
                      setShowVerification(false);
                    } else {
                      setError('Please fill in all required fields');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  disabled={!candidateInfo.name || !candidateInfo.email || !candidateInfo.phone}
                >
                  Confirm & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};