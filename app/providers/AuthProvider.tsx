'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
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
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get or create user in our database
          const userDoc = await usersService.createUserIfNotExists(firebaseUser);
          const userData = mapUserToMetadata(firebaseUser, userDoc);
          
          setUser(firebaseUser);
          setUserData(userData);
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error setting up user:', error);
        setError(error instanceof Error ? error : new Error('Failed to setup user'));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await usersService.createUserIfNotExists(result.user);
      const userData = mapUserToMetadata(result.user, userDoc);
      return { userCredential: result, userData };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { userCredential: null, userData: null };
    }
  };

  const signIn = async (email: string, password: string): Promise<UserMetadata> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await usersService.createUserIfNotExists(result.user);
    return mapUserToMetadata(result.user, userDoc);
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    const userDoc = await usersService.createUserIfNotExists(result.user);
    const userData = mapUserToMetadata(result.user, userDoc);
    return { userCredential: result, userData };
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/');
  };

  const contextValue: AuthContextType = {
    user,
    userData,
    loading,
    error,
    signInWithGoogle,
    signIn,
    signUp,
    signOut
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
