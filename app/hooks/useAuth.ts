import { auth } from '@/app/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const signup = async (email: string, password: string) => {
    return await auth.createUserWithEmailAndPassword(email, password)
  }

  const signin = async (email: string, password: string) => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const idToken = await userCredential.user.getIdToken();
      
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      window.location.href = '/dashboard/posts';
      return userCredential;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign in with Google
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get the ID token
      const idToken = await result.user.getIdToken();
      console.log('Got ID token, creating session...');
      
      // Send token to backend to create session
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      console.log('Sign in successful');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error?.message || 'An error occurred during sign in');
      
      // If it's a Firebase Auth error, provide more specific error messages
      if (error?.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            setError('Sign in was cancelled');
            break;
          case 'auth/popup-blocked':
            setError('Sign in popup was blocked. Please allow popups for this site');
            break;
          default:
            setError(`Authentication error: ${error.message}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Delete session cookie first
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      
      // Then sign out from Firebase
      await firebaseSignOut(auth);
      
      console.log('Sign out successful');
      router.push('/sign-in');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error?.message || 'An error occurred during sign out');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      setUser(null);
      await firebaseSignOut(auth);
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  return {
    user,
    loading,
    error,
    signup,
    signin,
    signInWithGoogle,
    signOut,
    logout
  }
}
