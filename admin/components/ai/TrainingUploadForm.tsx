'use client';

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Upload, FileText, Loader2, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'https://rag.ekowlabs.space/api/v1/upload';

interface TrainingUploadFormProps {
  audience: 'Admin' | 'SuperAdmin';
}

const TrainingUploadForm: React.FC<TrainingUploadFormProps> = ({ audience }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const validateAndSetFile = useCallback((selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed.');
      setFile(null);
      return false;
    }
    setFile(selectedFile);
    return true;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, [validateAndSetFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('audience', audience);

    setIsSubmitting(true);
    setProgress(0);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: { total?: number; loaded?: number }) => {
          if (progressEvent.total && progressEvent.loaded) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(Math.min(percent, 95));
          }
        },
      };

      await axios.post(API_URL, formData, config);

      setProgress(100);
      toast.success('File uploaded successfully.');
      setFile(null);
      setTimeout(() => setProgress(null), 800);
    } catch (error) {
      console.error('Error uploading file:', error);
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to upload file';
      toast.error(message);
      setProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-100 p-3 rounded-xl">
          <Upload className="w-7 h-7 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">AI Education Upload</h1>
          <p className="text-gray-600">Upload PDF documents to improve the AI knowledge base.</p>
          <p className="text-xs text-gray-500 mt-1">Audience: {audience}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drag and drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-red-400 bg-red-50'
              : file
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-red-300'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isSubmitting}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {isSubmitting ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 animate-spin text-red-600" />
              <p className="text-gray-600 mt-2">Uploading...</p>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center">
              <FileText className="w-10 h-10 text-green-600" />
              <p className="font-medium text-green-800 mt-2">{file.name}</p>
              <p className="text-sm text-gray-600">{Math.round(file.size / 1024)} KB</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="mt-3 flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-gray-400" />
              <p className="text-gray-600 mt-2 font-medium">Drag and drop a PDF file here</p>
              <p className="text-gray-400 text-sm">or click to browse</p>
              <p className="text-xs text-gray-500 mt-2">Only PDF files are accepted</p>
            </div>
          )}
        </div>

        {progress !== null && !isSubmitting && (
          <div
            className={`flex items-center gap-2 text-sm ${
              progress === 100 ? 'text-green-700' : 'text-gray-700'
            }`}
          >
            {progress === 100 ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            )}
            {progress === 100 ? 'Upload complete!' : `Uploading... ${progress}%`}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !file}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload File
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TrainingUploadForm;
