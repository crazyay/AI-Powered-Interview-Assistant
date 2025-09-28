'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
  error?: string;
}

export function FileUpload({ onFileSelect, loading, error }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    disabled: loading,
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-blue-500 bg-blue-50',
          isDragReject && 'border-red-500 bg-red-50',
          !isDragActive && !isDragReject && 'border-gray-300 hover:border-gray-400',
          loading && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          ) : (
            <div className="p-3 rounded-full bg-blue-100">
              {isDragReject ? (
                <AlertCircle className="h-6 w-6 text-red-500" />
              ) : (
                <Upload className="h-6 w-6 text-blue-500" />
              )}
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {loading ? 'Processing Resume...' : 'Upload Resume'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isDragReject
                ? 'Only PDF and DOCX files are supported'
                : isDragActive
                ? 'Drop your resume here'
                : 'Drag & drop or click to select (PDF or DOCX)'}
            </p>
          </div>
          
          {!loading && (
            <Button variant="outline" className="mt-2">
              <FileText className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}