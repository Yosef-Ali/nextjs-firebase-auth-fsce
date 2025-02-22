'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../firebase/auth';
import { getUserData, UserData } from '../firebase/user';

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    error: Error | null;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    error: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (user) {
            getUserData(user)
                .then(data => setUserData(data))
                .catch(err => setError(err instanceof Error ? err : new Error('Failed to load user data')));
        } else {
            setUserData(null);
            setError(null);
        }
    }, [user]);

    const value = {
        user,
        userData,
        loading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}