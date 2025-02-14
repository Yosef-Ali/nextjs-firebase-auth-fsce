"use client";

import { UserRole, UserStatus, UserMetadata, User } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { usersService } from '@/app/services/users';
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    UserCredential,
    sendPasswordResetEmail
} from 'firebase/auth';
import { authorization } from '../lib/authorization';

export interface AuthUser extends FirebaseUser {
    role?: UserRole;
    status?: UserStatus;
}

interface AuthError extends Error {
    code?: string;
}

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

export function useAuth(): AuthContextType {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userData, setUserData] = useState<UserMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AuthError | null>(null);
    const router = useRouter();

    const createUserMetadata = (
        firebaseUser: FirebaseUser,
        userData: User
    ): UserMetadata => {
        const now = Date.now();
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userData.role,
            status: userData.status,
            displayName: userData.displayName || firebaseUser.displayName,
            photoURL: userData.photoURL || firebaseUser.photoURL,
            metadata: {
                lastLogin: firebaseUser.metadata?.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime).getTime() : now,
                createdAt: userData.createdAt || (firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime).getTime() : now)
            }
        };
    };

    // Handle role-based routing
    const handleRoleBasedRedirect = (userData: User) => {
        const currentPath = window.location.pathname;
        const isProtectedRoute = currentPath.startsWith('/dashboard');

        if (!isProtectedRoute) return;

        if (!authorization.hasRole(userData as AuthUser, UserRole.EDITOR)) {
            router.replace('/unauthorized');
            return;
        }

        // Specific dashboard section restrictions
        if (currentPath.includes('/dashboard/users') && !authorization.canManageUsers(userData as AuthUser)) {
            router.replace('/dashboard');
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                setError(null);
                if (firebaseUser) {
                    const userData = await usersService.createUserIfNotExists(firebaseUser);
                    if (userData) {
                        const authUser = {
                            ...firebaseUser,
                            role: userData.role,
                            status: userData.status
                        } as AuthUser;

                        const userMetadata = createUserMetadata(firebaseUser, userData);

                        setUser(authUser);
                        setUserData(userMetadata);

                        // Check if user is active
                        if (userData.status !== UserStatus.ACTIVE) {
                            router.replace('/account-pending');
                            return;
                        }

                        handleRoleBasedRedirect(userData);
                    } else {
                        setUser(null);
                        setUserData(null);
                        router.replace('/sign-in');
                    }
                } else {
                    setUser(null);
                    setUserData(null);
                }
            } catch (err) {
                console.error('Error in auth state change:', err);
                setError(err as AuthError);
                setUser(null);
                setUserData(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleAuthError = (error: any): AuthError => {
        console.error('Authentication error:', error);
        const errorMessage = error.code === 'auth/user-not-found' ? 'No account found with this email' :
            error.code === 'auth/wrong-password' ? 'Incorrect password' :
                error.code === 'auth/invalid-email' ? 'Invalid email format' :
                    error.code === 'auth/email-already-in-use' ? 'Email already registered' :
                        error.code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later' :
                            error.code === 'auth/popup-closed-by-user' ? 'Sign-in popup was closed' :
                                'Authentication failed';

        const authError = {
            message: errorMessage,
            name: 'AuthError',
            code: error.code
        } as AuthError;

        setError(authError);
        return authError;
    };

    const signIn = async (email: string, password: string): Promise<UserMetadata> => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            const userData = await usersService.createUserIfNotExists(result.user);
            if (!userData) {
                throw new Error('Failed to create or fetch user data');
            }
            // Set user and userData state immediately after successful sign in
            const authUser = {
                ...result.user,
                role: userData.role,
                status: userData.status
            } as AuthUser;
            setUser(authUser);
            const metadata = createUserMetadata(result.user, userData);
            setUserData(metadata);
            return metadata;
        } catch (error: any) {
            // Handle specific Firebase auth errors
            const errorMessage = error.code === 'auth/user-not-found' ? 'No account found with this email' :
                error.code === 'auth/wrong-password' ? 'Incorrect password' :
                    error.code === 'auth/invalid-email' ? 'Invalid email format' :
                        error.code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later' :
                            'Failed to sign in';
            const authError = {
                message: errorMessage,
                name: 'AuthError',
                code: error.code
            } as AuthError;
            throw authError;
        }
    };

    const signUp = async (email: string, password: string, displayName: string): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const userData = await usersService.createUserIfNotExists(result.user);
            if (!userData) {
                throw new Error('Failed to create user data');
            }
            return {
                userCredential: result,
                userData: createUserMetadata(result.user, userData)
            };
        } catch (error) {
            return handleAuthError(error);
        }
    };

    const signInWithGoogle = async (): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const userData = await usersService.createUserIfNotExists(result.user);
            if (!userData) {
                throw new Error('Failed to create or fetch user data');
            }
            return {
                userCredential: result,
                userData: createUserMetadata(result.user, userData)
            };
        } catch (error) {
            return handleAuthError(error);
        }
    };

    const resetPassword = async (email: string): Promise<void> => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            handleAuthError(error);
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            await firebaseSignOut(auth);
            router.replace('/sign-in');
        } catch (error) {
            handleAuthError(error);
        }
    };

    return {
        user,
        userData,
        loading,
        error,
        signIn,
        signOut,
        signInWithGoogle,
        signUp,
        resetPassword
    };
}