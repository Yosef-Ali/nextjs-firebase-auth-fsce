'use client';

import { createContext, useContext } from 'react';
import { useAuth as useFirebaseAuth } from '@/lib/hooks/useAuth';

interface AuthContextType {
  user: any | null;
  userData: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  signUp: (email: string, password: string, displayName: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, userData, loading, signIn, signOut, signInWithGoogle, signUp } = useFirebaseAuth();

  return (
    <AuthContext.Provider value={{ user, userData, loading, signIn, signOut, signInWithGoogle, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext) as AuthContextType;
}
