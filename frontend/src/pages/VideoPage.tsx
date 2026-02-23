import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoService } from '../services/video.service';
import { BackgroundGradient } from '../components/ui/background-gradient';
import { Button } from '../components/ui/button';
import { CommentSection } from '../components/comment/CommentSection';
import { AIChatbot } from '../components/ai/AIChatbot';
import { EnhancedVideoPlayer } from '../components/video/EnhancedVideoPlayer';
import { RelatedVideos } from '../components/video/RelatedVideos';
import { ShareButton } from '../components/video/ShareButton';
import { VideoNotes } from '../components/video/VideoNotes';
import { VideoActions } from '../components/video/VideoActions';
import { formatDate, formatViews } from '../lib/utils';
import {
  Heart,
  Eye,
  Calendar,
  User,
  BookOpen,
  FileText,
  Download,
  Tag,
  GraduationCap,
  Layers,
  Wand2,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export const VideoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  const { data: video, isLoading, error, refetch } = useQuery({
    queryKey: ['video', id],
    queryFn: () => videoService.getVideoById(id!),
    enabled: !!id,
  });

  const transcriptMutation = useMutation({
    mutationFn: () => videoService.generateTranscript(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video', id] });
    },
  });

  const handleLike = async () => {
    if (!id) return;
    try {
      await videoService.toggleLike(id);
      setIsLiked(!isLiked);
      refetch();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'pptx':
      case 'ppt':
        return '📊';
      case 'docx':
      case 'doc':
        return '📝';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

  if (error || !video) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="container mx-auto px-4 py-20">
          <BackgroundGradient className="p-12 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-3xl font-bold mb-4">Video Not Found</h1>
            <p className="text-gray-400 mb-6">
              The video you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </BackgroundGradient>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white page-enter">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BackgroundGradient className="p-0 overflow-hidden">
                <EnhancedVideoPlayer
                  videoUrl={video.videoUrl}
                  thumbnailUrl={video.thumbnailUrl}
                  videoId={id!}
                  chapters={video.chapters || []}
                  onTimeUpdate={setCurrentVideoTime}
                />
              </BackgroundGradient>
            </motion.div>

            {/* Video Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BackgroundGradient className="p-4 sm:p-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">{video.title}</h1>

                {/* Metadata Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {video.unit && (
                    <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      <Layers size={14} />
                      {video.unit}
                    </span>
                  )}
                  {video.year && (
                    <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      <GraduationCap size={14} />
                      {video.year}
                    </span>
                  )}
                  {video.subject && (
                    <span className="inline-flex items-center gap-1 bg-green-600/20 text-green-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      <BookOpen size={14} />
                      {video.subject}
                    </span>
                  )}
                  {video.semester && (
                    <span className="inline-flex items-center gap-1 bg-orange-600/20 text-orange-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      Sem {video.semester}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 text-sm sm:text-base text-gray-400">
                  <span className="flex items-center gap-2">
                    <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                    {formatViews(video.views || 0)} views
                  </span>
                  <span className="flex items-center gap-2">
                    <Heart
                      size={16}
                      className={`sm:w-[18px] sm:h-[18px] ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    {video.likes?.length || 0} likes
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                    {formatDate(video.createdAt)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button
                    onClick={handleLike}
                    variant={isLiked ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                    {isLiked ? 'Liked' : 'Like'}
                  </Button>
                  
                  <VideoActions videoId={id!} />
                  <ShareButton videoId={id!} title={video.title} />
                  <VideoNotes videoId={id!} currentTime={currentVideoTime} />
                </div>

                {/* Description */}
                {video.description && (
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2">Description</h2>
                    <p className="text-sm sm:text-base text-gray-300 whitespace-pre-wrap">
                      {video.description}
                    </p>
                  </div>
                )}

                {/* Topics */}
                {video.topics && video.topics.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                      <Tag size={18} />
                      Topics Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {video.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="bg-slate-800 text-gray-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {video.tags && video.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </BackgroundGradient>
            </motion.div>

            {/* Transcript Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BackgroundGradient className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText size={18} className="sm:w-[20px] sm:h-[20px]" />
                  Transcript
                </h2>
                {video.transcript ? (
                  <div className="bg-slate-900/50 p-3 sm:p-4 rounded-lg max-h-96 overflow-y-auto">
                    <p className="text-sm sm:text-base text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {video.transcript}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 mb-4 text-sm">
                      No transcript available yet.
                    </p>
                    <button
                      onClick={() => transcriptMutation.mutate()}
                      disabled={transcriptMutation.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-semibold text-sm hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
                    >
                      {transcriptMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Generating Transcript...
                        </>
                      ) : (
                        <>
                          <Wand2 size={16} />
                          Generate Transcript with AI
                        </>
                      )}
                    </button>
                    {transcriptMutation.isError && (
                      <p className="text-red-400 text-sm mt-2">
                        {(transcriptMutation.error as any)?.response?.data?.message ||
                          'Failed to generate transcript. Please try again.'}
                      </p>
                    )}
                  </div>
                )}
              </BackgroundGradient>
            </motion.div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-4 sm:space-y-6">
            {/* Uploader Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BackgroundGradient className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                  <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Uploaded By
                </h3>
                {video.uploadedBy && (
                  <div className="flex items-center gap-3">
                    {video.uploadedBy.picture && (
                      <img
                        src={video.uploadedBy.picture}
                        alt={video.uploadedBy.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-purple-500"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-sm sm:text-base">{video.uploadedBy.name}</div>
                      <div className="text-xs sm:text-sm text-gray-400 break-all">
                        {video.uploadedBy.email}
                      </div>
                      {video.uploadedBy.department && (
                        <div className="text-xs text-gray-500 mt-1">
                          {video.uploadedBy.department}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </BackgroundGradient>
            </motion.div>

            {/* Related Documents */}
            {video.documents && video.documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <BackgroundGradient className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Related Documents ({video.documents.length})
                  </h3>
                  <div className="space-y-3">
                    {video.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="bg-slate-900/50 rounded-lg p-3 sm:p-4 hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                            <span className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(doc.type)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs sm:text-sm truncate">
                                {doc.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {doc.type.toUpperCase()} • {formatFileSize(doc.size)}
                              </div>
                            </div>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                          >
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Download size={16} />
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Download All Button */}
                  {video.documents.length > 1 && (
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => {
                        video.documents.forEach((doc) => {
                          window.open(doc.url, '_blank');
                        });
                      }}
                    >
                      <Download size={16} className="mr-2" />
                      Download All Documents
                    </Button>
                  )}
                </BackgroundGradient>
              </motion.div>
            )}

            {/* Video Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <BackgroundGradient className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Statistics</h3>
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Views</span>
                    <span className="font-semibold">{formatViews(video.views || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Likes</span>
                    <span className="font-semibold">{video.likes?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Documents</span>
                    <span className="font-semibold">{video.documents?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shares</span>
                    <span className="font-semibold">{video.shares || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uploaded</span>
                    <span className="font-semibold text-xs sm:text-sm">{formatDate(video.createdAt)}</span>
                  </div>
                </div>
              </BackgroundGradient>
            </motion.div>

            {/* Related Videos */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <BackgroundGradient className="p-4 sm:p-6">
                <RelatedVideos videoId={id!} limit={6} />
              </BackgroundGradient>
            </motion.div>
          </div>
        </div>

        {/* Comment Section - Full Width Below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 sm:mt-6"
        >
          <CommentSection videoId={id!} />
        </motion.div>

        {/* AI Chatbot */}
        <AIChatbot videoId={id!} />
      </div>
    </div>
  );
};

export default VideoPage;
