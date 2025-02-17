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

interface AuthContextType {
  user: AuthUser | null;
  userData: UserMetadata | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<UserMetadata>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ userCredential: UserCredential; userData: UserMetadata }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ userCredential: UserCredential; userData: UserMetadata }>;
  resetPassword: (email: string) => Promise<void>;
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const createUserMetadata = (
    firebaseUser: FirebaseUser,
    userData: User
  ): UserMetadata => {
    const now = Date.now();
    return {
      lastLogin: now,
      createdAt: userData.createdAt || now,
      role: userData.role || UserRole.USER,
      status: userData.status || UserStatus.ACTIVE,
      displayName: userData.displayName || firebaseUser.displayName,
      email: userData.email || firebaseUser.email,
      photoURL: userData.photoURL || firebaseUser.photoURL,
      uid: firebaseUser.uid,
      emailVerified: firebaseUser.emailVerified,
      providerData: firebaseUser.providerData,
      refreshToken: firebaseUser.refreshToken,
      phoneNumber: firebaseUser.phoneNumber,
      tenantId: firebaseUser.tenantId
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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

            const userMetadata = createUserMetadata(firebaseUser, userData);

            setUser(authUser);
            setUserData(userMetadata);
          } else {
            setUser(null);
            setUserData(null);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        const authError = handleAuthError(err);
        setError(authError);
        setUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
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

  const signUp = async (email: string, password: string, displayName: string): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userData = await usersService.createUserIfNotExists(result.user);

      if (!userData) {
        throw new Error('Failed to create user data');
      }

      return {
        userCredential: result,
        userData: createUserMetadata(result.user, userData)
      };
    } catch (error) {
      const authError = handleAuthError(error);
      setError(authError);
      throw authError;
    }
  };

  const signInWithGoogle = async (): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userData = await usersService.createUserIfNotExists(result.user);

      if (!userData) {
        throw new Error('Failed to create or fetch user data');
      }

      return {
        userCredential: result,
        userData: createUserMetadata(result.user, userData)
      };
    } catch (error) {
      const authError = handleAuthError(error);
      setError(authError);
      throw authError;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
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
    signOut,
    signInWithGoogle,
    signUp,
    resetPassword
  };
}
