import React from 'react';

export const PlaylistsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Playlists
          </span>
        </h1>
        <p className="text-gray-400">Playlists coming soon...</p>
      </div>
    </div>
  );
};

export default PlaylistsPage;
