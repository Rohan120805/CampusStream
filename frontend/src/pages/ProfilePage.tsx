import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth0();

  return (
    <div className="min-h-screen bg-slate-950 text-white page-enter">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8"
        >
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Profile
          </span>
        </motion.h1>

        {user && (
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-effect rounded-xl p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  src={user.picture}
                  alt={user.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-purple-500 shadow-lg shadow-purple-500/50"
                />
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">{user.name}</h2>
                  <p className="text-gray-400 text-sm sm:text-base break-all">{user.email}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm ${
                      user.email_verified 
                        ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                        : 'bg-red-600/20 text-red-400 border border-red-600/50'
                    }`}>
                      {user.email_verified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {user.email_verified ? 'Verified' : 'Not Verified'}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-xs sm:text-sm border border-purple-600/50">
                      <Shield size={14} />
                      Auth0 Protected
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-900/50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <User size={18} className="text-purple-400" />
                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Full Name</label>
                  </div>
                  <p className="text-white text-sm sm:text-base pl-8">{user.name}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-slate-900/50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Mail size={18} className="text-blue-400" />
                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Email Address</label>
                  </div>
                  <p className="text-white text-sm sm:text-base pl-8 break-all">{user.email}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-slate-900/50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Shield size={18} className="text-green-400" />
                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Auth0 ID</label>
                  </div>
                  <p className="text-white text-xs sm:text-sm font-mono pl-8 break-all">{user.sub}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-slate-900/50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle size={18} className="text-yellow-400" />
                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Email Verification Status</label>
                  </div>
                  <div className="pl-8">
                    {user.email_verified ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                        <CheckCircle size={18} />
                        <span>Email Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400 text-sm sm:text-base">
                        <XCircle size={18} />
                        <span>Email Not Verified</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Security Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-effect rounded-xl p-4 sm:p-6"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield size={20} />
                Security Information
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Your account is secured with Auth0 enterprise-grade authentication</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span>All your data is encrypted and stored securely</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Access is restricted to @klh.edu.in email addresses only</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
