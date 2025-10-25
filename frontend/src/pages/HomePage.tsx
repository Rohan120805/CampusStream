import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { videoService } from '../services/video.service';
import { BackgroundGradient } from '../components/ui/background-gradient';
import { Button } from '../components/ui/button';
import { formatDate, formatViews, formatDuration } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    semester: '',
    unit: '',
    year: '',
    sortBy: 'createdAt',
    order: 'desc' as 'asc' | 'desc',
  });

  // Get and store the access token
  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
          localStorage.setItem('auth0_token', accessToken);
          console.log('✅ Auth0 token obtained and stored');
        } catch (error) {
          console.error('❌ Error getting token:', error);
        }
      }
    };
    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['videos', filters],
    queryFn: () => videoService.getAllVideos(filters),
  });

  // Fetch all subjects dynamically from the database
  const { data: subjectsData, isLoading: isLoadingSubjects, error: subjectsError } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => videoService.getAllSubjects(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const subjects = subjectsData || [];
  const semesters = ['1', '2'];

  // Debug logging
  React.useEffect(() => {
    console.log('📚 Subjects data:', subjects);
    console.log('⏳ Loading subjects:', isLoadingSubjects);
    if (subjectsError) {
      console.error('❌ Subjects error:', subjectsError);
    }
  }, [subjects, isLoadingSubjects, subjectsError]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Authentication Status Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <BackgroundGradient className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-4 border-purple-500"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold">
                    Welcome back, {user?.name || 'User'}! 👋
                  </h2>
                  <p className="text-gray-400">{user?.email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="flex items-center text-green-400">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Authenticated
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-blue-400">
                      Token: {token ? '✅ Active' : '⏳ Loading...'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Auth0 ID</div>
                  <div className="text-xs text-gray-500 font-mono">
                    {user?.sub?.substring(0, 20)}...
                  </div>
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Discover Videos
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            🎓 Explore thousands of educational videos from faculty and peers
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search videos..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <select
              value={filters.subject}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={filters.unit}
              onChange={(e) =>
                setFilters({ ...filters, unit: e.target.value })
              }
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            >
              <option value="">All Units</option>
              <option value="CO1">CO1</option>
              <option value="CO2">CO2</option>
              <option value="CO3">CO3</option>
              <option value="CO4">CO4</option>
              <option value="CO5">CO5</option>
            </select>

            <select
              value={filters.year}
              onChange={(e) =>
                setFilters({ ...filters, year: e.target.value })
              }
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            >
              <option value="">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>

            <select
              value={filters.semester}
              onChange={(e) =>
                setFilters({ ...filters, semester: e.target.value })
              }
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            >
              <option value="">All Semesters</option>
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  Sem {semester}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            >
              <option value="createdAt">Latest</option>
              <option value="views">Most Viewed</option>
              <option value="likes">Most Liked</option>
              <option value="title">Title</option>
            </select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  search: '',
                  subject: '',
                  semester: '',
                  unit: '',
                  year: '',
                  sortBy: 'createdAt',
                  order: 'desc',
                })
              }
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BackgroundGradient className="p-8 max-w-md mx-auto">
              <div className="text-red-400 text-xl mb-4">
                ⚠️ Failed to load videos
              </div>
              <p className="text-gray-400 mb-4">
                {(error as any)?.response?.status === 401
                  ? 'Authentication failed. Please try logging in again.'
                  : 'Unable to connect to the server. Please try again later.'}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </BackgroundGradient>
          </motion.div>
        )}

        {/* Videos Grid */}
        {data && data.data && data.data.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {data.data.map((video: any, index: number) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => navigate(`/video/${video._id}`)}
                className="cursor-pointer"
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
                          <svg
                            className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                          </svg>
                        </div>
                      )}

                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
                          {formatDuration(video.duration)}
                        </div>
                      )}

                      {/* Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          whileHover={{ scale: 1.1 }}
                          className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50"
                        >
                          <svg
                            className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
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
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {formatViews(video.views || 0)}
                          </span>

                          <span className="flex items-center">
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                            {video.likes?.length || 0}
                          </span>

                          {video.documents && video.documents.length > 0 && (
                            <span className="flex items-center text-green-400" title="Documents available">
                              <svg
                                className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              {video.documents.length}
                            </span>
                          )}
                        </div>

                        <span className="hidden sm:inline">{formatDate(video.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </BackgroundGradient>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          !isLoading &&
          !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BackgroundGradient className="p-12 max-w-2xl mx-auto">
                <div className="text-6xl mb-6">📚</div>
                <div className="text-2xl font-bold mb-4">No Videos Yet</div>
                <p className="text-gray-400 mb-6">
                  Be the first to upload educational content!
                  <br />
                  Start building your campus's video library.
                </p>
                <div className="space-y-3 text-left max-w-md mx-auto mb-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">
                      Authentication is working perfectly
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">
                      Backend connection established
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-400">ℹ</span>
                    <span className="text-gray-300">
                      Upload videos from the Upload page
                    </span>
                  </div>
                </div>
                <Button onClick={() => navigate('/upload')} size="lg">
                  Upload Your First Video
                </Button>
              </BackgroundGradient>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};
