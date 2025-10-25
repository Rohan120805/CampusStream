import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { playlistService } from '../services/playlist.service';
import { motion } from 'framer-motion';
import { PlayCircle, BookOpen, GraduationCap, Video } from 'lucide-react';

export const PlaylistsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const { data: playlists, isLoading, error } = useQuery({
    queryKey: ['playlists-by-subject'],
    queryFn: () => playlistService.getPlaylistsBySubject(),
  });

  const years = ['all', '1st Year', '2nd Year', '3rd Year', '4th Year'];

  const filteredPlaylists = playlists?.filter((playlist: any) => 
    selectedYear === 'all' || playlist.year === selectedYear
  ) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white py-4 sm:py-8 page-enter">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Subject Playlists
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Browse lectures organized by subject and year
          </p>
        </motion.div>

        {/* Year Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-thin"
        >
          {years.map((year, index) => (
            <motion.button
              key={year}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedYear(year)}
              className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 text-sm sm:text-base ${
                selectedYear === year
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:scale-105'
              }`}
            >
              {year === 'all' ? 'All Years' : year}
            </motion.button>
          ))}
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="glass-effect p-8 max-w-md mx-auto rounded-xl">
              <p className="text-red-400 text-base sm:text-lg">Error loading playlists. Please try again.</p>
            </div>
          </motion.div>
        )}

        {/* Playlists Grid */}
        {!isLoading && !error && (
          <>
            {filteredPlaylists.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <BookOpen className="mx-auto mb-4 text-gray-600" size={48} />
                <p className="text-gray-400 text-base sm:text-lg">No playlists found for the selected year</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredPlaylists.map((playlist: any, index: number) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="glass-effect rounded-xl overflow-hidden hover:border-purple-500 transition-all duration-300 cursor-pointer border border-slate-800"
                    onClick={() => navigate(`/playlists/${playlist.id}`, { state: { playlist } })}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-40 sm:h-48 bg-gradient-to-br from-purple-900/20 to-blue-900/20 overflow-hidden">
                      {playlist.thumbnailUrl ? (
                        <img
                          src={playlist.thumbnailUrl}
                          alt={playlist.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen size={48} className="text-purple-400 opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <Video size={14} />
                        <span className="text-xs">{playlist.videoCount} videos</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-1">
                        {playlist.subject}
                      </h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-3">
                        <GraduationCap size={16} className="text-purple-400" />
                        <span>{playlist.year}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-3">
                        {playlist.description}
                      </p>
                      <button
                        className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/50 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm hover:scale-105 active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/playlists/${playlist.id}`, { state: { playlist } });
                        }}
                      >
                        <PlayCircle size={18} />
                        <span>View Playlist</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Stats */}
        {!isLoading && !error && filteredPlaylists.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center text-gray-400 text-sm sm:text-base"
          >
            <p>Showing {filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? 's' : ''}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;
