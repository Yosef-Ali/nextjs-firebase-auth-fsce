'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { useAuth } from '@/app/hooks/use-auth';
import type { AuthUser } from '@/app/hooks/use-auth';
import type { UserMetadata } from '@/app/types/user';
import type { UserCredential } from 'firebase/auth';

interface AuthContextType {
    user: AuthUser | null;
    userData: UserMetadata | null;
    loading: boolean;
    error: Error | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userData, setUserData] = useState<UserMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const signIn = async (email: string, password: string) => {
        // ...existing code...
    };

    const signOut = async () => {
        // ...existing code...
    };

    const signInWithGoogle = async () => {
        // ...existing code...
    };

    const signUp = async (email: string, password: string) => {
        // ...existing code...
    };

    const resetPassword = async (email: string) => {
        // ...existing code...
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, error, signIn, signOut, signInWithGoogle, signUp, resetPassword }}>
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