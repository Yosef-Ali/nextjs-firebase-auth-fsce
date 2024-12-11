import { User } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
import { auth } from '@/lib/auth';
import { usersService } from '@/app/services/users';
import { AuthContext } from '@/app/providers/AuthProvider.tsx';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user: contextUser, loading: contextLoading, signUp, signIn, signOut, signInWithGoogle } = authContext;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Create or update user in Firestore whenever auth state changes
        const customUser = await usersService.createUserIfNotExists(user);
        setUser(customUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user: contextUser ? { ...contextUser, role: user?.role } : null,
    loading: contextLoading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };
}
