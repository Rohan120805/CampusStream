import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { playlistService } from '../services/playlist.service';
import { motion } from 'framer-motion';
import { PlayCircle, BookOpen, GraduationCap, Video, Clock } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Subject Playlists
            </span>
          </h1>
          <p className="text-gray-400">
            Browse lectures organized by subject and year
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedYear === year
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {year === 'all' ? 'All Years' : year}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-400">Error loading playlists. Please try again.</p>
          </div>
        )}

        {/* Playlists Grid */}
        {!isLoading && !error && (
          <>
            {filteredPlaylists.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="mx-auto mb-4 text-gray-600" size={64} />
                <p className="text-gray-400 text-lg">No playlists found for the selected year</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaylists.map((playlist: any) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500 transition-all cursor-pointer"
                    onClick={() => navigate(`/playlists/${playlist.id}`, { state: { playlist } })}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-blue-900/20 overflow-hidden">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <Video size={14} />
                        <span className="text-xs">{playlist.videoCount} videos</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                        {playlist.subject}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <GraduationCap size={16} className="text-purple-400" />
                        <span>{playlist.year}</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {playlist.description}
                      </p>
                      <button
                        className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/50 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
          <div className="mt-8 text-center text-gray-400">
            <p>Showing {filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;
