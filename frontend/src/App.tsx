import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { VideoPage } from './pages/VideoPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyVideosPage } from './pages/MyVideosPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  // Show loading spinner while Auth0 is checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />} 
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/video/:id"
        element={
          <ProtectedRoute>
            <VideoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <PlaylistsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-videos"
        element={
          <ProtectedRoute>
            <MyVideosPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN || '';
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || '';
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE || '';

  if (!domain || !clientId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h1>
          <p className="text-gray-400">Please check your Auth0 environment variables</p>
        </div>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "openid profile email"
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      onRedirectCallback={(appState) => {
        // Handle redirect after login, preserving any error parameters
        window.history.replaceState(
          {},
          document.title,
          appState?.returnTo || window.location.pathname
        );
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-slate-950">
            <Navbar />
            <AppRoutes />
          </div>
        </Router>
      </QueryClientProvider>
    </Auth0Provider>
  );
}

export default App;
