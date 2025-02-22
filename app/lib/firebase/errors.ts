import { FirebaseError } from 'firebase/app';

export type AuthErrorCode =
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/invalid-email'
    | 'auth/email-already-in-use'
    | 'auth/weak-password'
    | 'auth/network-request-failed'
    | 'auth/too-many-requests'
    | 'auth/requires-recent-login';

export interface AuthError extends Error {
    code?: string;
}

export function handleAuthError(error: unknown): string {
    if (error instanceof FirebaseError) {
        return getFirebaseErrorMessage(error.code);
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
}

function getFirebaseErrorMessage(code: string): string {
    switch (code) {
        case 'auth/user-not-found':
            return 'No account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later';
        case 'auth/requires-recent-login':
            return 'Please sign in again to complete this action';
        default:
            return 'Authentication error occurred';
    }
}