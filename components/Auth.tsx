import * as React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/app/providers/AuthProvider';

const googleProvider = new GoogleAuthProvider();

interface AuthProps {
  children?: React.ReactNode;
}

const Auth: React.FC<AuthProps> = ({ children }) => {
  const { user, loading } = useAuth();

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        children
      ) : (
        <div>
          <button onClick={signInWithGoogle}>
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth;
