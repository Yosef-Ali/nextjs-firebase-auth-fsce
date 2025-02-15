import type { AuthErrorCodes } from '@/app/types/auth-types';

const AUTH_ERROR_MESSAGES: Record<AuthErrorCodes, string> = {
    'auth/invalid-email': 'Invalid email address format.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/operation-not-allowed': 'Operation not allowed.',
    'auth/popup-closed-by-user': 'Sign in popup was closed before completion.',
    'auth/cancelled-popup-request': 'The sign in operation was cancelled.',
    'auth/popup-blocked': 'Sign in popup was blocked by the browser.'
};

export function handleAuthError(error: unknown): { code: AuthErrorCodes; message: string } {
    const errorCode = (error as { code?: string })?.code as AuthErrorCodes;

    return {
        code: errorCode,
        message: AUTH_ERROR_MESSAGES[errorCode] || 'An unexpected authentication error occurred.'
    };
}