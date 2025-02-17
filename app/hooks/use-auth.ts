"use client";

import { UserRole, UserStatus, UserMetadata, User } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from '@/lib/context/auth-context';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AuthUser extends User {
    role: UserRole;
    status: UserStatus;
    isAnonymous: boolean;
    id: string;
    invitedBy: string | null;
    invitationToken: string | null;
}

interface AuthError extends Error {
    code?: string;
}

export interface AuthContextType {
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
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context as AuthContextType;
}

export function createUserMetadata(firebaseUser: FirebaseUser, additionalData: any = {}): UserMetadata {
    const now = Date.now();
    return {
        lastLogin: now,
        createdAt: now,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: additionalData.role || UserRole.USER,
        status: additionalData.status || UserStatus.ACTIVE,
        emailVerified: firebaseUser.emailVerified
    };
}