'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { auth } from './firebase-config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { createUserData, getUserData, UserData } from './user-service';
import { LoadingScreen } from '@/components/loading-screen';

interface AuthContextType {
  user: any;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          // Get the ID token
          const idToken = await user.getIdToken();
          
          // Set the session cookie
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          const data = await getUserData(user);
          setUserData(data);
          setUser(user);
        } else {
          setUser(null);
          setUserData(null);
          // Clear the session cookie
          await fetch('/api/auth/session', { method: 'DELETE' });
        }
      } catch (err) {
        console.error('Auth state change error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential?.user) {
        throw new Error('No user data returned');
      }
      const userData = await getUserData(userCredential.user);
      setUserData(userData);
      return userCredential;
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/invalid-action-code') {
        throw new Error('Invalid action. Please try signing in again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await createUserData(result.user, displayName);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      if (!result?.user) {
        throw new Error('No user data returned from Google sign in');
      }
      
      let data = await getUserData(result.user);
      if (!data) {
        data = await createUserData(result.user, result.user.displayName || 'Unknown User');
      }
      
      setUserData(data);
      return { user: result.user, userData: data };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups and try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => signOut(auth);

  // Return loading screen while initializing
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
