'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { UserData } from '@/app/types/user';
import { usersService } from '@/app/services/users';
import { AuthLoadingScreen } from '@/app/components/loading-screen/AuthLoadingScreen';
import { AuthErrorBoundary, AuthErrorFallback } from '@/app/components/error-boundary/AuthErrorBoundary';

/** 
 * AuthContextType defines the shape of the authentication context
 * It includes Firebase user state, user data, loading states, and error states
 */
interface AuthContextType {
    // Auth state
    firebaseUser: FirebaseUser | null;
    userData: UserData | null;
    
    // Loading states
    isAuthLoading: boolean;    // Firebase auth loading
    isUserLoading: boolean;    // User data loading
    isLoading: boolean;        // Combined loading state
    
    // Error states
    authError: Error | null;
    userError: Error | null;

    // Methods
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    firebaseUser: null,
    userData: null,
    isAuthLoading: true,
    isUserLoading: true,
    isLoading: true,
    authError: null,
    userError: null,
    refreshUserData: async () => {},
});

/**
 * AuthProvider component manages authentication state and user data
 * It provides:
 * - Firebase authentication state
 * - User data synchronization
 * - Loading state management
 * - Error handling
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    // Auth state
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    
    // Loading states
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isUserLoading, setIsUserLoading] = useState(true);
    
    // Error states
    const [authError, setAuthError] = useState<Error | null>(null);
    const [userError, setUserError] = useState<Error | null>(null);

    /**
     * Fetches user data from the backend
     * Updates loading and error states accordingly
     */
    const fetchUserData = async () => {
        if (!firebaseUser?.uid) {
            setUserData(null);
            setIsUserLoading(false);
            return;
        }

        try {
            setIsUserLoading(true);
            const user = await usersService.getUser(firebaseUser.uid);
            setUserData(user);
            setUserError(null);
        } catch (error) {
            setUserError(error as Error);
            setUserData(null);
        } finally {
            setIsUserLoading(false);
        }
    };

    // Firebase auth state listener
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(
            (user) => {
                setFirebaseUser(user);
                setAuthError(null);
                setIsAuthLoading(false);
            },
            (error) => {
                setAuthError(error);
                setFirebaseUser(null);
                setIsAuthLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // User data fetch when auth state changes
    useEffect(() => {
        fetchUserData();
    }, [firebaseUser]);

    // Combined loading state
    const isLoading = isAuthLoading || isUserLoading;

    const value = {
        firebaseUser,
        userData,
        isAuthLoading,
        isUserLoading,
        isLoading,
        authError,
        userError,
        refreshUserData: fetchUserData,
    };

    // Show loading screen while initializing
    if (isLoading) {
        return <AuthLoadingScreen />;
    }

    return (
        <AuthErrorBoundary
            fallback={<AuthErrorFallback error={authError || userError} />}
        >
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </AuthErrorBoundary>
    );
}

/**
 * Custom hook to access the auth context
 * Throws an error if used outside of AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
