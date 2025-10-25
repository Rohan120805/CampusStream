import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/user.service';
import { BackgroundGradient } from '../components/ui/background-gradient';
import { motion } from 'framer-motion';
import { Bookmark, Play, Eye, Heart, Trash2 } from 'lucide-react';
import { formatDate, formatViews, formatDuration } from '../lib/utils';

export const BookmarksPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: bookmarks, isLoading, refetch } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => userService.getBookmarks(),
  });

  const handleRemoveBookmark = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await userService.toggleBookmark(videoId);
      refetch();
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-4 sm:py-8 page-enter">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <Bookmark className="text-purple-400" size={32} />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              My Bookmarks
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Videos you've saved for later reference
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {!isLoading && bookmarks && (
          <>
            {bookmarks.data.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <BackgroundGradient className="p-12 max-w-2xl mx-auto">
                  <Bookmark size={64} className="mx-auto mb-4 text-gray-600" />
                  <h2 className="text-2xl font-bold mb-4">No Bookmarks Yet</h2>
                  <p className="text-gray-400 mb-6">
                    Start bookmarking videos you want to reference later!
                  </p>
                </BackgroundGradient>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {bookmarks.data.map((video: any, index: number) => (
                  <motion.div
                    key={video._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    onClick={() => navigate(`/video/${video._id}`)}
                    className="cursor-pointer relative group"
                  >
                    <BackgroundGradient className="p-0 h-full overflow-hidden">
                      <div className="relative group h-full flex flex-col">
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-slate-800 overflow-hidden flex-shrink-0">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play size={48} className="text-gray-600" />
                            </div>
                          )}

                          {/* Duration Badge */}
                          {video.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
                              {formatDuration(video.duration)}
                            </div>
                          )}

                          {/* Remove Bookmark Button */}
                          <button
                            onClick={(e) => handleRemoveBookmark(video._id, e)}
                            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove bookmark"
                          >
                            <Trash2 size={16} />
                          </button>

                          {/* Play Icon Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                            <motion.div 
                              initial={{ scale: 0.8 }}
                              whileHover={{ scale: 1.1 }}
                              className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50"
                            >
                              <Play size={24} className="text-white ml-1" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="p-3 sm:p-4 flex-grow flex flex-col">
                          <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                            {video.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-gray-400 mb-3 line-clamp-2">
                            {video.description}
                          </p>

                          {/* Academic Info */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {video.unit && (
                              <span className="inline-block bg-purple-600/20 text-purple-400 text-xs px-2 py-0.5 rounded">
                                {video.unit}
                              </span>
                            )}
                            {video.year && (
                              <span className="inline-block bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded">
                                {video.year}
                              </span>
                            )}
                            {video.subject && (
                              <span className="inline-block bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded truncate max-w-full">
                                {video.subject}
                              </span>
                            )}
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {formatViews(video.views || 0)}
                              </span>
                              <span className="flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                {video.likes?.length || 0}
                              </span>
                            </div>
                            <span className="hidden sm:inline">{formatDate(video.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </BackgroundGradient>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Stats */}
            {bookmarks.data.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center text-gray-400 text-sm sm:text-base"
              >
                <p>{bookmarks.data.length} bookmarked video{bookmarks.data.length !== 1 ? 's' : ''}</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
