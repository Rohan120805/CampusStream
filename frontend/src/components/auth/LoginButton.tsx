import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../ui/button';

export const LoginButton: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button
      onClick={() => loginWithRedirect()}
      variant="default"
      size="lg"
      className="group relative overflow-hidden"
    >
      <span className="relative z-10">Login with Auth0</span>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Button>
  );
};

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth0();

  return (
    <Button
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      variant="outline"
      size="md"
    >
      Logout
    </Button>
  );
};
