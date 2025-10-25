import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { videoService } from '../../services/video.service';
import { motion } from 'framer-motion';
import { Play, Eye, Heart, Clock } from 'lucide-react';
import { formatDuration, formatViews } from '../../lib/utils';

interface RelatedVideosProps {
  videoId: string;
  limit?: number;
}

export const RelatedVideos: React.FC<RelatedVideosProps> = ({ videoId, limit = 6 }) => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['related-videos', videoId],
    queryFn: () => videoService.getRelatedVideos(videoId, limit),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-40 h-24 bg-slate-800 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-semibold mb-4">Related Videos</h3>
      <div className="space-y-3">
        {data.data.map((video: any, index: number) => (
          <motion.div
            key={video._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/video/${video._id}`)}
            className="flex gap-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group"
          >
            {/* Thumbnail */}
            <div className="relative w-40 h-24 flex-shrink-0 bg-slate-900">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play size={24} className="text-gray-600" />
                </div>
              )}
              
              {video.duration && (
                <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-xs">
                  {formatDuration(video.duration)}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={20} className="text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 py-2 pr-2 min-w-0">
              <h4 className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
                {video.title}
              </h4>
              
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                {video.uploadedBy && (
                  <span className="truncate">{video.uploadedBy.name}</span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {formatViews(video.views || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={12} />
                  {video.likes?.length || 0}
                </span>
              </div>

              {/* Tags */}
              <div className="flex gap-1 mt-1">
                {video.unit && (
                  <span className="inline-block bg-purple-600/20 text-purple-400 text-xs px-1.5 py-0.5 rounded">
                    {video.unit}
                  </span>
                )}
                {video.year && (
                  <span className="inline-block bg-blue-600/20 text-blue-400 text-xs px-1.5 py-0.5 rounded">
                    {video.year}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RelatedVideos;
