import { auth } from '@/app/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard/posts');
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut
  };
}
