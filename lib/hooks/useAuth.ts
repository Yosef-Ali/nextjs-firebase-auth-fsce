import { UserRole, UserMetadata } from '@/app/types/user';
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

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get or create user in our database
          const userDataResult = await usersService.createUserIfNotExists(firebaseUser);
          setUser(firebaseUser);
          setUserData(userDataResult);
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

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDataResult = await usersService.createUserIfNotExists(result.user);
      return userDataResult;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<{ userCredential: UserCredential, userData: UserMetadata }> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userDataResult = await usersService.createUserIfNotExists(result.user);
      return { userCredential: result, userData: userDataResult };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userDataResult = await usersService.createUserIfNotExists(result.user);
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
