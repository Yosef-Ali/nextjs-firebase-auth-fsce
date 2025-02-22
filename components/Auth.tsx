'use client';

import * as React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserContext } from '@/lib/context/UserContext';
import { UserStatus } from '@/app/types/user';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

const googleProvider = new GoogleAuthProvider();

interface AuthProps {
  children: React.ReactNode;
}

const Auth: React.FC<AuthProps> = ({ children }) => {
  const { user, loading } = useUserContext();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const signInWithGoogle = async () => {
    try {
      setIsSigningIn(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!children) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={signInWithGoogle}
          disabled={isSigningIn}
          className="w-full max-w-xs"
        >
          {isSigningIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in with Google"
          )}
        </Button>
      </div>
    );
  }

  return user && user.status === UserStatus.ACTIVE ? children : null;
};

export default Auth;
