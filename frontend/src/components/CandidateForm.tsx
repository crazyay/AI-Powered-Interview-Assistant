'use client';

import React, { useState } from 'react';
import { CandidateInfo } from '@/lib/slices/interviewSlice';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CandidateFormProps {
  candidateInfo: CandidateInfo;
  onUpdate: (info: CandidateInfo) => void;
  onStartInterview: () => void;
  missingFields?: { name: boolean; email: boolean; phone: boolean };
  loading?: boolean;
}

export function CandidateForm({
  candidateInfo,
  onUpdate,
  onStartInterview,
  missingFields,
  loading = false,
}: CandidateFormProps) {
  const [formData, setFormData] = useState(candidateInfo);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Sync form data with candidateInfo prop changes (e.g., from resume upload)
  React.useEffect(() => {
    console.log('CandidateInfo prop changed:', candidateInfo);
    setFormData({
      name: candidateInfo.name || '',
      email: candidateInfo.email || '',
      phone: candidateInfo.phone || '',
      resumeText: candidateInfo.resumeText || ''
    });
    // Clear any existing errors when new data comes in
    setErrors({});
  }, [candidateInfo.name, candidateInfo.email, candidateInfo.phone, candidateInfo.resumeText]);

  const validateForm = (dataToValidate = formData) => {
    const newErrors: Record<string, string> = {};
    
    console.log('Validating form data:', dataToValidate);
    
    if (!dataToValidate.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!dataToValidate.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataToValidate.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!dataToValidate.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(dataToValidate.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return; // Prevent double submission
    
    console.log('Form submitted with data:', formData);
    
    // Validate first
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }
    
    // Update parent state and start interview
    onUpdate(formData);
    onStartInterview();
  };

  const handleFieldChange = (field: keyof CandidateInfo, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    
    // Update parent immediately
    onUpdate(updatedData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    console.log(`Field ${field} updated to:`, value);
  };

  const isFieldMissing = (field: string) => missingFields?.[field as keyof typeof missingFields];

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Candidate Information</h2>
        <p className="text-gray-600 mt-2">
          Please verify your details before starting the interview
        </p>
      </div>

      {missingFields && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-sm font-medium text-yellow-800">
              Missing Information
            </h3>
          </div>
          <p className="text-sm text-yellow-700">
            Some required information is missing from your resume. Please fill in the details below.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Full Name</span>
              {isFieldMissing('name') && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              errors.name ? 'border-red-500' : isFieldMissing('name') ? 'border-yellow-500' : 'border-gray-300'
            )}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email Address</span>
              {isFieldMissing('email') && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              errors.email ? 'border-red-500' : isFieldMissing('email') ? 'border-yellow-500' : 'border-gray-300'
            )}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Phone Number</span>
              {isFieldMissing('phone') && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              errors.phone ? 'border-red-500' : isFieldMissing('phone') ? 'border-yellow-500' : 'border-gray-300'
            )}
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-6"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Starting Interview...</span>
            </div>
          ) : (
            'Start Interview'
          )}
        </Button>
      </form>
    </div>
  );
}