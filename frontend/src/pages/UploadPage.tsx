import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { videoService } from '../services/video.service';
import { Upload, FileVideo, FileText, Image, X, CheckCircle, Loader2 } from 'lucide-react';

interface UploadProgress {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
  progress: number;
}

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    unit: 'CO1',
    year: '1st Year',
    semester: '1',
    topics: '',
    tags: ''
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    message: '',
    progress: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if file is a video
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
      } else {
        alert('Please select a valid video file');
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file);
      } else {
        alert('Please select a valid image file');
      }
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const validTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'application/vnd.ms-powerpoint'
        ];
        return validTypes.includes(file.type);
      });

      if (validFiles.length !== files.length) {
        alert('Some files were not added. Only PDF, PPTX, and DOCX files are allowed.');
      }

      setDocumentFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeDocument = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!videoFile) {
      alert('Please select a video file');
      return;
    }

    if (!formData.title || !formData.subject || !formData.unit || !formData.year) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setUploadProgress({
        status: 'uploading',
        message: 'Uploading your video and files...',
        progress: 0
      });

      const uploadFormData = new FormData();
      uploadFormData.append('video', videoFile);
      if (thumbnailFile) {
        uploadFormData.append('thumbnail', thumbnailFile);
      }
      documentFiles.forEach(file => {
        uploadFormData.append('documents', file);
      });

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        uploadFormData.append(key, value);
      });

      const response = await videoService.uploadVideo(uploadFormData);

      setUploadProgress({
        status: 'success',
        message: 'Video uploaded successfully! Transcription will be generated automatically.',
        progress: 100
      });

      setTimeout(() => {
        navigate(`/video/${response.data._id}`);
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadProgress({
        status: 'error',
        message: error.response?.data?.message || 'Failed to upload video. Please try again.',
        progress: 0
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Upload Video
          </span>
        </h1>
        <p className="text-gray-400 mb-2">Share your educational content with the community</p>
        <div className="flex items-center gap-2 text-sm text-green-400 mb-8">
          <FileText size={16} />
          <span>Transcription will be automatically generated using AI</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <label className="block mb-2 text-sm font-medium flex items-center gap-2">
              <FileVideo size={18} className="text-purple-400" />
              Video File <span className="text-red-400">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                id="video-upload"
                required
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                {videoFile ? (
                  <div className="text-green-400">
                    <CheckCircle className="inline mr-2" size={20} />
                    {videoFile.name} ({formatFileSize(videoFile.size)})
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-300 mb-2">Click to upload video</p>
                    <p className="text-sm text-gray-500">MP4, WebM, OGG, AVI, MOV (Max 500MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <label className="block mb-2 text-sm font-medium flex items-center gap-2">
              <Image size={18} className="text-blue-400" />
              Thumbnail (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {thumbnailFile && (
              <p className="mt-2 text-sm text-gray-400">
                <CheckCircle className="inline mr-1" size={16} />
                {thumbnailFile.name}
              </p>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Topic/Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to React Hooks"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this video covers..."
                rows={4}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </div>

          {/* Academic Details */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Academic Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Data Structures, Web Development, Machine Learning"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Unit <span className="text-red-400">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="CO1">CO1</option>
                  <option value="CO2">CO2</option>
                  <option value="CO3">CO3</option>
                  <option value="CO4">CO4</option>
                  <option value="CO5">CO5</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Year <span className="text-red-400">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Semester
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Topics (comma-separated)
              </label>
              <input
                type="text"
                name="topics"
                value={formData.topics}
                onChange={handleInputChange}
                placeholder="e.g., useState, useEffect, Custom Hooks"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., react, javascript, frontend"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Documents Upload */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <label className="block mb-4 text-sm font-medium flex items-center gap-2">
              <FileText size={18} className="text-green-400" />
              Related Documents (PDF, PPTX, DOCX)
            </label>
            
            <input
              type="file"
              accept=".pdf,.pptx,.docx,.ppt,.doc"
              multiple
              onChange={handleDocumentChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {documentFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-400 mb-2">{documentFiles.length} document(s) selected:</p>
                {documentFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-green-400" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress.status !== 'idle' && (
            <div className={`p-4 rounded-lg ${
              uploadProgress.status === 'uploading' ? 'bg-blue-900/20 border border-blue-800' :
              uploadProgress.status === 'success' ? 'bg-green-900/20 border border-green-800' :
              'bg-red-900/20 border border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {uploadProgress.status === 'uploading' && <Loader2 className="animate-spin" size={20} />}
                {uploadProgress.status === 'success' && <CheckCircle size={20} className="text-green-400" />}
                <p>{uploadProgress.message}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploadProgress.status === 'uploading'}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadProgress.status === 'uploading' ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
