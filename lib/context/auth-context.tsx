'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import type { AuthUser, UserMetadata } from '@/app/types/user';
import type { UserCredential } from 'firebase/auth';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

export { AuthContext };