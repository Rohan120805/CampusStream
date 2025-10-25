import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlayCircle, 
  BookOpen, 
  GraduationCap, 
  Video, 
  Eye,
  Calendar,
  ArrowLeft,
  User
} from 'lucide-react';
import { formatDate, formatViews } from '../lib/utils';

export const PlaylistDetailPage: React.FC = () => {
  const { id: _id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const playlist = location.state?.playlist;

  if (!playlist) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Playlist not found</p>
          <button
            onClick={() => navigate('/playlists')}
            className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/playlists')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Playlists</span>
        </button>

        {/* Playlist Header */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            <div className="w-full md:w-80 h-48 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg overflow-hidden flex-shrink-0">
              {playlist.thumbnailUrl ? (
                <img
                  src={playlist.thumbnailUrl}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen size={64} className="text-purple-400 opacity-50" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {playlist.subject}
              </h1>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <GraduationCap size={18} className="text-purple-400" />
                  <span>{playlist.year}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Video size={18} className="text-blue-400" />
                  <span>{playlist.videoCount} videos</span>
                </div>
              </div>
              <p className="text-gray-300 mb-4">{playlist.description}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => playlist.videos[0] && navigate(`/video/${playlist.videos[0]._id}`)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center gap-2 transition-all"
                  disabled={!playlist.videos || playlist.videos.length === 0}
                >
                  <PlayCircle size={20} />
                  <span>Play All</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Videos List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Videos</h2>
          <div className="space-y-4">
            {playlist.videos && playlist.videos.length > 0 ? (
              playlist.videos.map((video: any, index: number) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-purple-500 transition-all cursor-pointer"
                  onClick={() => navigate(`/video/${video._id}`)}
                >
                  <div className="flex gap-4">
                    {/* Index */}
                    <div className="flex items-center justify-center w-8 text-gray-500 font-semibold">
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-40 h-24 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Video size={32} className="text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PlayCircle size={32} className="text-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1 line-clamp-1 hover:text-purple-400 transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                        {video.uploadedBy && (
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{video.uploadedBy.name}</span>
                          </div>
                        )}
                        {video.unit && (
                          <div className="flex items-center gap-1">
                            <BookOpen size={14} />
                            <span>{video.unit}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{formatViews(video.views || 0)} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(video.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-lg">
                <Video className="mx-auto mb-4 text-gray-600" size={48} />
                <p className="text-gray-400">No videos in this playlist</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailPage;
