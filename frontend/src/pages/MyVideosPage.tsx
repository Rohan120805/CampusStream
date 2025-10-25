import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoService } from '../services/video.service';
import { BackgroundGradient } from '../components/ui/background-gradient';
import { Button } from '../components/ui/button';
import { formatDate, formatViews } from '../lib/utils';
import { 
  Play, 
  Eye, 
  Heart, 
  Edit, 
  Trash2, 
  Calendar,
  BookOpen,
  Layers,
  GraduationCap,
  FileText,
  Upload,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';

interface EditModalProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditVideoModal: React.FC<EditModalProps> = ({ video, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: video.title,
    description: video.description,
    subject: video.subject,
    unit: video.unit,
    year: video.year,
    semester: video.semester,
    topics: video.topics.join(', '),
    tags: video.tags.join(', '),
  });
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Prepare data with proper types
      const updateData = {
        ...formData,
        topics: formData.topics.split(',').map(t => t.trim()).filter(t => t),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      // Update video details
      await videoService.updateVideo(video._id, updateData);

      // Update transcript if file is provided
      if (transcriptFile) {
        const transcriptFormData = new FormData();
        transcriptFormData.append('transcript', transcriptFile);
        await videoService.updateTranscription(video._id, transcriptFormData);
      }

      queryClient.invalidateQueries({ queryKey: ['myVideos'] });
      queryClient.invalidateQueries({ queryKey: ['video', video._id] });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white">Edit Video</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              >
                <option value="">Select Unit</option>
                <option value="CO1">CO1</option>
                <option value="CO2">CO2</option>
                <option value="CO3">CO3</option>
                <option value="CO4">CO4</option>
                <option value="CO5">CO5</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Topics (comma-separated)
            </label>
            <input
              type="text"
              name="topics"
              value={formData.topics}
              onChange={handleChange}
              placeholder="e.g., Introduction, Basics, Advanced"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., programming, tutorial, beginner"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload/Update Transcript (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".txt"
                onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
              />
            </div>
            {transcriptFile && (
              <p className="text-sm text-green-400 mt-2">
                Selected: {transcriptFile.name}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Updating...' : 'Update Video'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const MyVideosPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['myVideos'],
    queryFn: videoService.getMyVideos,
  });

  const deleteMutation = useMutation({
    mutationFn: (videoId: string) => videoService.deleteVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVideos'] });
      setDeletingVideoId(null);
    },
    onError: (error) => {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
      setDeletingVideoId(null);
    },
  });

  const handleDelete = (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      setDeletingVideoId(videoId);
      deleteMutation.mutate(videoId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="container mx-auto px-4 py-20">
          <BackgroundGradient className="p-12 text-center">
            <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-3xl font-bold mb-4">Error Loading Videos</h1>
            <p className="text-gray-400 mb-6">
              Failed to load your videos. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </BackgroundGradient>
        </div>
      </div>
    );
  }

  const videos = data?.data || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Videos</h1>
          <p className="text-gray-400">Manage your uploaded videos</p>
        </div>

        {/* Upload Button */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2"
          >
            <Upload size={18} />
            Upload New Video
          </Button>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <BackgroundGradient className="p-12 text-center">
            <div className="text-6xl mb-4">📹</div>
            <h2 className="text-2xl font-bold mb-2">No Videos Yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't uploaded any videos yet. Start sharing your knowledge!
            </p>
            <Button onClick={() => navigate('/upload')}>
              <Upload size={18} className="mr-2" />
              Upload Your First Video
            </Button>
          </BackgroundGradient>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video: Video) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <BackgroundGradient className="h-full">
                  <div className="p-0 h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play size={48} className="text-gray-600" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                        {video.views || 0} views
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {video.title}
                      </h3>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {video.unit && (
                          <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded text-xs">
                            <Layers size={12} />
                            {video.unit}
                          </span>
                        )}
                        {video.year && (
                          <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-xs">
                            <GraduationCap size={12} />
                            {video.year}
                          </span>
                        )}
                        {video.subject && (
                          <span className="inline-flex items-center gap-1 bg-green-600/20 text-green-400 px-2 py-0.5 rounded text-xs">
                            <BookOpen size={12} />
                            {video.subject}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {video.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={14} />
                          {video.likes?.length || 0}
                        </span>
                        {video.transcript && (
                          <span className="flex items-center gap-1 text-green-400">
                            <FileText size={14} />
                            Transcript
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 mb-4">
                        <Calendar size={12} className="inline mr-1" />
                        {formatDate(video.createdAt)}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/video/${video._id}`)}
                        >
                          <Play size={14} className="mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingVideo(video)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 hover:text-red-300 hover:border-red-400"
                          onClick={() => handleDelete(video._id)}
                          disabled={deletingVideoId === video._id}
                        >
                          {deletingVideoId === video._id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </BackgroundGradient>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          isOpen={!!editingVideo}
          onClose={() => setEditingVideo(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['myVideos'] });
          }}
        />
      )}
    </div>
  );
};

export default MyVideosPage;
