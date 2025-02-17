import { UserRole, UserStatus, UserMetadata, User } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { usersService } from '@/app/services/users';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  UserCredential,
  sendPasswordResetEmail
} from 'firebase/auth';
import { handleAuthError } from '@/app/lib/auth-errors';

export interface AuthUser extends FirebaseUser {
  role?: UserRole;
  status?: UserStatus;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const createUserMetadata = (firebaseUser: FirebaseUser, userData: User): UserMetadata => {
    const now = Date.now();
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: userData.role,
      status: userData.status,
      displayName: userData.displayName || firebaseUser.displayName,
      photoURL: userData.photoURL || firebaseUser.photoURL,
      metadata: {
        lastLogin: now,
        createdAt: userData.createdAt || now
      }
    };
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isSubscribed = true;

    const setupAuthListener = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!isSubscribed) return;

          try {
            setError(null);
            if (firebaseUser) {
              const userData = await usersService.createUserIfNotExists(firebaseUser);
              
              if (userData) {
                const authUser = {
                  ...firebaseUser,
                  role: userData.role,
                  status: userData.status
                } as AuthUser;

                setUser(authUser);
                setUserData(createUserMetadata(firebaseUser, userData));
              } else {
                setUser(null);
                setUserData(null);
              }
            } else {
              setUser(null);
              setUserData(null);
            }
          } catch (err) {
            console.error('Auth state change error:', err);
            setError(handleAuthError(err));
            setUser(null);
            setUserData(null);
          } finally {
            if (isSubscribed) {
              setLoading(false);
            }
          }
        });
      } catch (setupError) {
        if (isSubscribed) {
          console.error('Auth listener setup error:', setupError);
          setError(handleAuthError(setupError));
          setLoading(false);
        }
      }
    };

    setupAuthListener();

    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<UserMetadata> => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await usersService.createUserIfNotExists(result.user);

      if (!userData) {
        throw new Error('Failed to create or fetch user data');
      }

      const authUser = {
        ...result.user,
        role: userData.role,
        status: userData.status
      } as AuthUser;

      setUser(authUser);
      const metadata = createUserMetadata(result.user, userData);
      setUserData(metadata);
      return metadata;
    } catch (error) {
      const authError = handleAuthError(error);
      setError(authError);
      throw authError;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      router.replace('/sign-in');
    } catch (error) {
      const authError = handleAuthError(error);
      setError(authError);
      throw authError;
    }
  };

  return {
    user,
    userData,
    loading,
    error,
    signIn,
    signOut
  };
}
