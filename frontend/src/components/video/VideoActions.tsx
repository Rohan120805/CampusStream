import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { Bookmark, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoActionsProps {
  videoId: string;
}

export const VideoActions: React.FC<VideoActionsProps> = ({ videoId }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const queryClient = useQueryClient();

  // Check if video is already bookmarked or in watch later
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const bookmarks = await userService.getBookmarks();
        const watchLater = await userService.getWatchLater();
        
        setIsBookmarked(bookmarks.data.some((v: any) => v._id === videoId));
        setIsInWatchLater(watchLater.data.some((v: any) => v._id === videoId));
      } catch (error) {
        console.error('Error checking video status:', error);
      }
    };

    checkStatus();
  }, [videoId]);

  const bookmarkMutation = useMutation({
    mutationFn: () => userService.toggleBookmark(videoId),
    onSuccess: (data) => {
      setIsBookmarked(data.data.isBookmarked);
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const watchLaterMutation = useMutation({
    mutationFn: () => userService.toggleWatchLater(videoId),
    onSuccess: (data) => {
      setIsInWatchLater(data.data.isInWatchLater);
      queryClient.invalidateQueries({ queryKey: ['watch-later'] });
    },
  });

  return (
    <div className="flex gap-3">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => bookmarkMutation.mutate()}
        disabled={bookmarkMutation.isPending}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 border ${
          isBookmarked
            ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30'
            : 'bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700'
        }`}
      >
        <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
        <span className="text-sm">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => watchLaterMutation.mutate()}
        disabled={watchLaterMutation.isPending}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 border ${
          isInWatchLater
            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
            : 'bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700'
        }`}
      >
        <Clock size={18} fill={isInWatchLater ? 'currentColor' : 'none'} />
        <span className="text-sm">{isInWatchLater ? 'In Watch Later' : 'Watch Later'}</span>
      </motion.button>
    </div>
  );
};

export default VideoActions;
