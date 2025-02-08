import { FirebaseError } from 'firebase/app';

export type AuthErrorCode =
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/invalid-email'
    | 'auth/email-already-in-use'
    | 'auth/weak-password'
    | 'auth/network-request-failed'
    | 'auth/too-many-requests'
    | 'auth/popup-closed-by-user'
    | 'auth/requires-recent-login'
    | 'auth/user-disabled'
    | 'auth/operation-not-allowed'
    | 'auth/invalid-credential'
    | 'auth/invalid-verification-code'
    | 'auth/invalid-verification-id'
    | 'auth/missing-verification-code'
    | 'auth/missing-verification-id'
    | 'auth/credential-already-in-use';

export interface AuthError extends Error {
    code?: string;
}

export function handleAuthError(error: unknown): AuthError {
    if (error instanceof FirebaseError) {
        const errorMessage = getFirebaseErrorMessage(error.code);
        return {
            message: errorMessage,
            name: 'AuthError',
            code: error.code
        };
    }

    // Handle non-Firebase errors
    return {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        name: 'AuthError'
    };
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
        case 'auth/popup-closed-by-user':
            return 'Sign in was cancelled';
        case 'auth/requires-recent-login':
            return 'Please sign in again to complete this action';
        case 'auth/user-disabled':
            return 'This account has been disabled';
        case 'auth/operation-not-allowed':
            return 'This operation is not allowed';
        case 'auth/invalid-credential':
            return 'Invalid login credentials';
        case 'auth/invalid-verification-code':
            return 'Invalid verification code';
        case 'auth/invalid-verification-id':
            return 'Invalid verification ID';
        case 'auth/missing-verification-code':
            return 'Please enter the verification code';
        case 'auth/missing-verification-id':
            return 'Missing verification ID';
        case 'auth/credential-already-in-use':
            return 'This account is already connected to another user';
        default:
            return 'An error occurred during authentication';
    }
}