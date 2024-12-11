import { UserRole, UserMetadata, UserDataResult } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { usersService } from '@/app/services/users';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  UserCredential
} from 'firebase/auth';

export interface AuthUser extends FirebaseUser {
  role?: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const createUserMetadata = (
    firebaseUser: FirebaseUser,
    userDataResult: UserDataResult
  ): UserMetadata => {
    const now = Date.now();
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: userDataResult.role,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      metadata: {
        lastLogin: userDataResult.metadata?.lastLogin ?? now,
        createdAt: userDataResult.metadata?.createdAt ?? now
      }
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDataResult = await usersService.createUserIfNotExists(firebaseUser);
          if (userDataResult) {
            const authUser = {
              ...firebaseUser,
              role: userDataResult.role
            } as AuthUser;
            
            const userMetadata = createUserMetadata(firebaseUser, userDataResult);
            
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
      } catch (error) {
        console.error('Error setting up user:', error);
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
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDataResult = await usersService.createUserIfNotExists(result.user);
      if (!userDataResult) {
        throw new Error('Failed to create or fetch user data');
      }
      return createUserMetadata(result.user, userDataResult);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<{ userCredential: UserCredential, userData: UserMetadata }> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userDataResult = await usersService.createUserIfNotExists(result.user);
      if (!userDataResult) {
        throw new Error('Failed to create user data');
      }
      const metadata = createUserMetadata(result.user, userDataResult);
      return { userCredential: result, userData: metadata };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<{ userCredential: UserCredential, userData: UserMetadata }> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userDataResult = await usersService.createUserIfNotExists(result.user);
      if (!userDataResult) {
        throw new Error('Failed to create or fetch user data');
      }
      return { userCredential: result, userData: userDataResult };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    userData,
    loading,
    signIn,
    signOut,
    signInWithGoogle,
    signUp
  };
}
