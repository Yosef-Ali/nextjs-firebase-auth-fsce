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
import { AuthError, handleAuthError } from '@/app/lib/auth-errors';

export interface AuthUser extends FirebaseUser {
    role?: UserRole;
    status?: UserStatus;
}

export function useAuth() {
    // ...existing code...
}