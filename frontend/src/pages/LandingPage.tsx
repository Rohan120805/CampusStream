import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles } from '../components/ui/sparkles';
import { BackgroundGradient } from '../components/ui/background-gradient';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, error, logout } = useAuth0();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authError, setAuthError] = React.useState<string | null>(null);

  // Handle login with fresh prompt
  const handleLogin = async () => {
    try {
      // Clear any existing Auth0 session first
      await logout({ 
        logoutParams: { 
          returnTo: window.location.origin 
        },
        openUrl: false // Don't redirect, just clear session
      });
      
      // Small delay to ensure logout completes
      setTimeout(() => {
        loginWithRedirect({
          authorizationParams: {
            prompt: 'login', // Force login prompt even if user has session
            screen_hint: 'login' // Show login screen
          }
        });
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      // Fallback: just try to login
      loginWithRedirect({
        authorizationParams: {
          prompt: 'login',
          screen_hint: 'login'
        }
      });
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }

    // Check for Auth0 error in URL parameters
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      if (errorParam === 'unauthorized' || errorParam === 'access_denied') {
        setAuthError(
          errorDescription || 
          'Access restricted to @klh.edu.in email addresses only. Please use your institutional email to login.'
        );
      } else {
        setAuthError(errorDescription || 'Authentication failed. Please try again.');
      }
    }

    // Check for Auth0 React error
    if (error) {
      setAuthError(error.message || 'Authentication error occurred');
    }
  }, [isAuthenticated, navigate, searchParams, error]);

  const features = [
    {
      icon: '🎓',
      title: 'Academic Excellence',
      description: 'Access comprehensive lecture videos organized by subject and semester',
    },
    {
      icon: '📚',
      title: 'Smart Playlists',
      description: 'Curated playlists following your syllabus for structured learning',
    },
    {
      icon: '🔍',
      title: 'Advanced Search',
      description: 'Find exactly what you need with powerful search and filters',
    },
    {
      icon: '💬',
      title: 'Interactive Learning',
      description: 'Engage with Q&A, comments, and discussions on every video',
    },
    {
      icon: '👨‍🏫',
      title: 'Faculty Uploads',
      description: 'Direct access to content from your professors and educators',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Optimized streaming with instant playback and smooth experience',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Hero Section */}
      <Sparkles className="min-h-screen" density={100} speed={2}>
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-block mb-8"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <svg
                  className="w-14 h-14 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CampusStream
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Your Ultimate Learning Platform for Academic Excellence
              <br />
              <span className="text-blue-400 font-semibold">
                Stream, Learn, Excel
              </span>
            </motion.p>

            {/* Error Alert */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-8 max-w-2xl mx-auto"
              >
                <div className="bg-red-500/10 border-2 border-red-500/50 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-400 mb-2">
                        Access restricted to @klh.edu.in email addresses only. Please use your institutional email to login.
                      </h3>
                      <p className="text-red-200 text-sm leading-relaxed">
                        {authError}
                      </p>
                      {authError.includes('@klh.edu.in') && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-300 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>This platform is exclusively for KLH students and faculty.</span>
                          </p>
                        </div>
                      )}
                      <div className="mt-4 flex gap-3">
                        <Button
                          onClick={handleLogin}
                          size="sm"
                          className="flex-1"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Try Again with Different Email
                        </Button>
                        <Button
                          onClick={() => setAuthError(null)}
                          variant="outline"
                          size="sm"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                    <button
                      onClick={() => setAuthError(null)}
                      className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={handleLogin}
                size="lg"
                className="text-lg px-10 py-6 group relative overflow-hidden shadow-2xl shadow-purple-500/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  🔐 Login with Auth0
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-6"
                onClick={() => {
                  document
                    .getElementById('features')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </motion.div>

            {/* Auth Status Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="mt-8 text-sm text-gray-400"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secured by Auth0 • Enterprise-grade authentication</span>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20"
            >
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  1000+
                </div>
                <div className="text-gray-400 mt-2">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  50+
                </div>
                <div className="text-gray-400 mt-2">Subjects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  5000+
                </div>
                <div className="text-gray-400 mt-2">Students</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Sparkles>

      {/* Features Section */}
      <div id="features" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features designed for modern learning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <BackgroundGradient className="p-6 h-full">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </BackgroundGradient>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Ready to Start Learning?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of students already using CampusStream to excel in
              their studies
            </p>
            <Button
              onClick={handleLogin}
              size="lg"
              className="text-lg px-12 py-6"
            >
              Login with Auth0
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2025 CampusStream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
