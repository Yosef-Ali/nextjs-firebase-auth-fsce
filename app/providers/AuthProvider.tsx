'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/app/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { usersService } from '@/app/services/users';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      console.log('Setting up auth state listener...');
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        if (user) {
          try {
            await usersService.createUserIfNotExists(user);
          } catch (err) {
            console.error('Error creating user:', err);
          }
        }
        setUser(user);
        setLoading(false);
      }, (error) => {
        console.error('Auth state change error:', error);
        setError(error);
        setLoading(false);
      });

      return () => {
        console.log('Cleaning up auth state listener...');
        unsubscribe();
      };
    } catch (err) {
      console.error('Error setting up auth state listener:', err);
      setError(err instanceof Error ? err : new Error('Failed to setup auth'));
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error signing in with Google:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  if (error) {
    console.error('Auth provider error:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
