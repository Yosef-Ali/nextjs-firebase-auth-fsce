'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/app/hooks/use-auth';
import type { AppUser, UserMetadata } from '@/app/types/user';
import type { UserCredential } from 'firebase/auth';
import type { AuthContextType } from '@/app/types/auth-types';

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
