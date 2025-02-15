"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getUserData, createUserData, UserData } from '@/app/lib/firebase/user-service';
import { UserRole, UserStatus } from '../types/user';
import type { AppUser, UserMetadata } from '../types/user';
import type { AuthErrorCodes } from '../types/auth-types';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    UserCredential
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

function convertToUserMetadata(userData: UserData): UserMetadata {
    const now = Date.now();
    return {
        uid: userData.uid,
        email: userData.email || null,
        role: userData.role || UserRole.USER,
        status: userData.status || UserStatus.PENDING,
        displayName: userData.displayName || null,
        photoURL: null,
        metadata: {
            lastLogin: userData.metadata?.lastLogin || now,
            createdAt: userData.metadata?.createdAt || now
        }
    };
}

export function useAuth() {
    const [user, setUser] = useState<AppUser | null>(null);
    const [userData, setUserData] = useState<UserMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!mounted) return;

            try {
                setLoading(true);
                setError(null);

                if (firebaseUser) {
                    try {
                        // Get user data from Firestore
                        const userDoc = await getUserData(firebaseUser);

                        if (userDoc) {
                            if (mounted) {
                                setUserData(convertToUserMetadata(userDoc));
                                setUser(firebaseUser as AppUser);
                            }
                        } else {
                            // If no user data exists, create it
                            const newUserData = await createUserData(firebaseUser, firebaseUser.displayName || '');
                            if (mounted) {
                                setUserData(convertToUserMetadata(newUserData));
                                setUser(firebaseUser as AppUser);
                            }
                        }
                    } catch (e) {
                        console.error("Error handling user data:", e);
                        if (mounted) {
                            setError(e as Error);
                        }
                    }
                } else {
                    if (mounted) {
                        setUser(null);
                        setUserData(null);
                    }
                }
            } catch (e) {
                console.error("Auth state change error:", e);
                if (mounted) {
                    setError(e as Error);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getUserData(result.user);
            if (userDoc) {
                setUserData(convertToUserMetadata(userDoc));
                return { user: result.user, userData: userDoc };
            }
            throw new Error('User data not found after sign in');
        } catch (e) {
            console.error("Sign in error:", e);
            setError(e as Error);
            throw e;
        }
    };

    const signInWithGoogle = async () => {
        try {
            setError(null);
            const result = await signInWithPopup(auth, googleProvider);
            const userDoc = await getUserData(result.user);
            if (userDoc) {
                setUserData(convertToUserMetadata(userDoc));
                return { user: result.user, userData: userDoc };
            }
            throw new Error('User data not found after Google sign in');
        } catch (e) {
            console.error("Google sign in error:", e);
            setError(e as Error);
            throw e;
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const newUserData = await createUserData(result.user, displayName);
            setUserData(convertToUserMetadata(newUserData));
            return { user: result.user, userData: newUserData };
        } catch (e) {
            console.error("Sign up error:", e);
            setError(e as Error);
            throw e;
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
            router.push('/');
        } catch (e) {
            console.error("Sign out error:", e);
            setError(e as Error);
            throw e;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (e) {
            console.error("Password reset error:", e);
            setError(e as Error);
            throw e;
        }
    };

    const hasRole = (requiredRole: UserRole): boolean => {
        if (!userData || !userData.role) return false;

        // Define role hierarchy
        const roleHierarchy: Record<UserRole, UserRole[]> = {
            [UserRole.SUPER_ADMIN]: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER, UserRole.GUEST],
            [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER, UserRole.GUEST],
            [UserRole.AUTHOR]: [UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER, UserRole.GUEST],
            [UserRole.EDITOR]: [UserRole.EDITOR, UserRole.USER, UserRole.GUEST],
            [UserRole.USER]: [UserRole.USER, UserRole.GUEST],
            [UserRole.GUEST]: [UserRole.GUEST]
        };

        return roleHierarchy[userData.role]?.includes(requiredRole) || false;
    };

    return {
        user,
        userData,
        loading,
        error,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        resetPassword,
        hasRole
    };
}
