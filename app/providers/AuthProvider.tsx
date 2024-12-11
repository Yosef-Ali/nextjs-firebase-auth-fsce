'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  UserCredential,
  signInWithPopup
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { usersService } from '@/app/services/users';
import { User, UserMetadata, UserStatus, UserRole } from '@/app/types/user';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserMetadata | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<{ userCredential: UserCredential; userData: UserMetadata }>;
  signIn: (email: string, password: string) => Promise<UserMetadata>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ userCredential: UserCredential; userData: UserMetadata }>;
  signOut: () => Promise<void>;
  reauthenticateWithPassword: (password: string) => Promise<UserCredential>;
}

const googleProvider = new GoogleAuthProvider();

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const mapUserToMetadata = (firebaseUser: FirebaseUser, userDoc?: User | null): UserMetadata => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: userDoc?.displayName ?? firebaseUser.displayName ?? '',
      photoURL: userDoc?.photoURL ?? firebaseUser.photoURL ?? '',
      emailVerified: firebaseUser.emailVerified,
      isAnonymous: firebaseUser.isAnonymous,
      role: userDoc?.role ?? UserRole.USER,
      status: userDoc?.status ?? UserStatus.ACTIVE,
      createdAt: userDoc?.createdAt ?? Date.now(),
      updatedAt: userDoc?.updatedAt ?? Date.now(),
      invitedBy: userDoc?.invitedBy ?? null,
      invitationToken: userDoc?.invitationToken ?? null,
      metadata: {
        lastLogin: Date.now(),
        createdAt: userDoc?.createdAt ?? Date.now()
      }
    } as UserMetadata;
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
        setUserData(null);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    let unsubDoc: any;

    if (user?.uid) {
      unsubDoc = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          const userData = mapUserToMetadata(user, doc.data() as User);
          setUserData(userData);
        }
        setLoading(false);
      });
    }

    return () => unsubDoc?.();
  }, [user]);

  const signInWithGoogle = async (): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await usersService.createUserIfNotExists(result.user);
      const userData = mapUserToMetadata(result.user, userDoc);
      return { userCredential: result, userData };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const err = error instanceof Error ? error : new Error('Failed to sign in with Google');
      setError(err);
      throw err;
    }
  };

  const signIn = async (email: string, password: string): Promise<UserMetadata> => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await usersService.createUserIfNotExists(result.user);
      return mapUserToMetadata(result.user, userDoc);
    } catch (error) {
      console.error('Error signing in:', error);
      const err = error instanceof Error ? error : new Error('Failed to sign in');
      setError(err);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      const userDoc = await usersService.createUserIfNotExists(result.user);
      const userData = mapUserToMetadata(result.user, userDoc);
      return { userCredential: result, userData };
    } catch (error) {
      console.error('Error signing up:', error);
      const err = error instanceof Error ? error : new Error('Failed to sign up');
      setError(err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      const err = error instanceof Error ? error : new Error('Failed to sign out');
      setError(err);
      throw err;
    }
  };

  const reauthenticateWithPassword = async (password: string) => {
    if (!user?.email) {
      throw new Error('No user email found');
    }
    
    try {
      const credential = await signInWithEmailAndPassword(auth, user.email, password);
      return credential;
    } catch (error) {
      console.error('Reauthentication error:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    userData,
    loading,
    error,
    signInWithGoogle,
    signIn,
    signUp,
    signOut,
    reauthenticateWithPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
