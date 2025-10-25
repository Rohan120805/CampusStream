import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../ui/button';
import { LogoutButton } from '../auth/LoginButton';
import { Menu, X, Home, List, Upload, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/playlists', label: 'Playlists', icon: List },
    { to: '/my-videos', label: 'My Videos', icon: Video },
    { to: '/upload', label: 'Upload', icon: Upload },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/95 border-b border-slate-800 shadow-lg shadow-purple-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-shadow duration-300"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-6 h-6 text-white"
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
            </motion.div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CampusStream
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive(link.to)
                        ? 'text-white bg-purple-600/20'
                        : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon size={16} />
                    {link.label}
                    {isActive(link.to) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/50"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <img
                    src={user?.picture}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full border-2 border-purple-500 transition-transform hover:border-purple-400"
                  />
                  <span className="hidden lg:inline text-gray-300 text-sm">
                    {user?.name?.split(' ')[0]}
                  </span>
                </motion.button>
                <LogoutButton />
              </>
            ) : (
              <Button
                onClick={() => navigate('/')}
                variant="default"
                size="md"
                className="shadow-lg shadow-purple-500/20"
              >
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </motion.button>
          )}

          {/* Mobile User Avatar (shown on small screens) */}
          {isAuthenticated && (
            <div className="md:hidden flex items-center space-x-2">
              <img
                src={user?.picture}
                alt={user?.name}
                className="w-8 h-8 rounded-full border-2 border-purple-500"
                onClick={() => navigate('/profile')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isActive(link.to)
                          ? 'text-white bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50'
                          : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon size={20} />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="pt-4 border-t border-slate-800 mt-4"
              >
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  <img
                    src={user?.picture}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full border-2 border-purple-500"
                  />
                  <div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.15 }}
                className="pt-2"
              >
                <LogoutButton />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
