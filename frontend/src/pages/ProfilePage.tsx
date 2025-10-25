import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth0();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Profile
          </span>
        </h1>

        {user && (
          <div className="bg-slate-900 rounded-lg p-6 max-w-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={user.picture}
                alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-purple-500"
              />
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Auth0 ID</label>
                <p className="text-white">{user.sub}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email Verified</label>
                <p className="text-white">
                  {user.email_verified ? '✅ Yes' : '❌ No'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
