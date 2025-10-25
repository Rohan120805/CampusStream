import React from 'react';
import { useParams } from 'react-router-dom';

export const VideoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Video Page</h1>
        <p className="text-gray-400">Video ID: {id}</p>
        <p className="text-gray-500 mt-4">Coming soon...</p>
      </div>
    </div>
  );
};

export default VideoPage;
