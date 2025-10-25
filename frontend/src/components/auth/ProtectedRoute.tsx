import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const saveToken = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          console.log('🔄 Requesting Auth0 access token...');
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            },
            cacheMode: 'on', // Use cached token if available
          });
          localStorage.setItem('auth0_token', token);
          console.log('✅ Auth0 token obtained and stored');
          setTokenReady(true);
        } catch (error) {
          console.error('❌ Error getting token:', error);
          // Try without audience as fallback
          try {
            const token = await getAccessTokenSilently({
              cacheMode: 'on',
            });
            localStorage.setItem('auth0_token', token);
            console.log('✅ Token obtained (no audience)');
            setTokenReady(true);
          } catch (err) {
            console.error('❌ Final error:', err);
            setTokenReady(true); // Proceed anyway
          }
        }
      }
    };
    saveToken();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!tokenReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Getting access token...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
