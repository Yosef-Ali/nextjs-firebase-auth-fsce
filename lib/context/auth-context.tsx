'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User as FirebaseUser, UserCredential, signInWithEmailAndPassword, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { UserMetadata, UserRole, UserStatus } from '@/app/types/user';
import { auth } from '@/lib/firebase';
import { usersService } from '@/app/services/users-service';

interface AuthContextType {
    user: FirebaseUser | null;
    userData: UserMetadata | null;
    loading: boolean;
    error?: Error | null;
    signIn: (email: string, password: string) => Promise<UserMetadata>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ userCredential: UserCredential; userData: UserMetadata }>;
    signUp: (email: string, password: string, displayName: string) => Promise<{ userCredential: UserCredential; userData: UserMetadata }>;
    resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    error: null,
    signIn: async () => { throw new Error('Not implemented') },
    signOut: async () => { throw new Error('Not implemented') },
    signInWithGoogle: async () => { throw new Error('Not implemented') },
    signUp: async () => { throw new Error('Not implemented') },
    resetPassword: async () => { throw new Error('Not implemented') }
});

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            try {
                setLoading(true);
                if (firebaseUser) {
                    const userDataFromService = await usersService.createUserIfNotExists(firebaseUser);
                    if (userDataFromService) {
                        const metadata: UserMetadata = {
                            lastLogin: Date.now(),
                            createdAt: userDataFromService.createdAt,
                            role: userDataFromService.role,
                            status: userDataFromService.status,
                            displayName: userDataFromService.displayName,
                            email: userDataFromService.email,
                            photoURL: userDataFromService.photoURL,
                            uid: userDataFromService.uid,
                            emailVerified: firebaseUser.emailVerified,
                            providerData: firebaseUser.providerData,
                            refreshToken: firebaseUser.refreshToken,
                            phoneNumber: firebaseUser.phoneNumber,
                            tenantId: firebaseUser.tenantId
                        };
                        setUserData(metadata);
                        setUser(firebaseUser);
                    }
                } else {
                    setUser(null);
                    setUserData(null);
                }
            } catch (error) {
                console.error('Error in auth state change:', error);
                setError(error instanceof Error ? error : new Error('Authentication error'));
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string): Promise<UserMetadata> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userDataFromService = await usersService.createUserIfNotExists(userCredential.user);
            if (!userDataFromService) {
                throw new Error('Failed to get user data');
            }
            const metadata: UserMetadata = {
                lastLogin: Date.now(),
                createdAt: userDataFromService.createdAt,
                role: userDataFromService.role,
                status: userDataFromService.status,
                displayName: userDataFromService.displayName,
                email: userDataFromService.email,
                photoURL: userDataFromService.photoURL,
                uid: userDataFromService.uid,
                emailVerified: userCredential.user.emailVerified,
                providerData: userCredential.user.providerData,
                refreshToken: userCredential.user.refreshToken,
                phoneNumber: userCredential.user.phoneNumber,
                tenantId: userCredential.user.tenantId
            };
            setUserData(metadata);
            setUser(userCredential.user);
            return metadata;
        } catch (error) {
            setError(error instanceof Error ? error : new Error('Failed to sign in'));
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('Failed to sign out'));
            throw error;
        }
    };

    const signInWithGoogle = async (): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const metadata: UserMetadata = {
                lastLogin: Date.now(),
                createdAt: Date.now(),
                role: UserRole.USER,
                status: UserStatus.ACTIVE,
                displayName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                uid: result.user.uid,
                emailVerified: result.user.emailVerified,
                providerData: result.user.providerData,
                refreshToken: result.user.refreshToken,
                phoneNumber: result.user.phoneNumber,
                tenantId: result.user.tenantId
            };
            setUserData(metadata);
            setUser(result.user);
            return { userCredential: result, userData: metadata };
        } catch (error) {
            setError(error instanceof Error ? error : new Error('Failed to sign in with Google'));
            throw error;
        }
    };

    const signUp = async (email: string, password: string, displayName: string): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const metadata: UserMetadata = {
                lastLogin: Date.now(),
                createdAt: Date.now(),
                role: UserRole.USER,
                status: UserStatus.ACTIVE,
                displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                uid: result.user.uid,
                emailVerified: result.user.emailVerified,
                providerData: result.user.providerData,
                refreshToken: result.user.refreshToken,
                phoneNumber: result.user.phoneNumber,
                tenantId: result.user.tenantId
            };
            setUserData(metadata);
            setUser(result.user);
            return { userCredential: result, userData: metadata };
        } catch (error) {
            setError(error instanceof Error ? error : new Error('Failed to sign up'));
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('Failed to reset password'));
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            error,
            signIn,
            signOut,
            signInWithGoogle,
            signUp,
            resetPassword
        }}>
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