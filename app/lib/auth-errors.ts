export enum AuthErrorCode {
    // Firebase Auth Error Codes
    EMAIL_EXISTS = 'auth/email-already-in-use',
    INVALID_EMAIL = 'auth/invalid-email',
    WEAK_PASSWORD = 'auth/weak-password',
    USER_NOT_FOUND = 'auth/user-not-found',
    WRONG_PASSWORD = 'auth/wrong-password',
    POPUP_CLOSED = 'auth/popup-closed-by-user',
    ACCOUNT_EXISTS = 'auth/account-exists-with-different-credential',
    INVALID_CREDENTIAL = 'auth/invalid-credential',
    OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed',
    USER_DISABLED = 'auth/user-disabled',
    TOO_MANY_REQUESTS = 'auth/too-many-requests',
    REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login',

    // Custom Error Codes
    USER_DATA_NOT_FOUND = 'custom/user-data-not-found',
    ROLE_UPDATE_FAILED = 'custom/role-update-failed',
    STATUS_UPDATE_FAILED = 'custom/status-update-failed',
    UNAUTHORIZED = 'custom/unauthorized',
    INVALID_ROLE = 'custom/invalid-role',
    SERVER_ERROR = 'custom/server-error'
}

export class AuthError extends Error {
    constructor(
        public code: AuthErrorCode,
        message?: string,
        public originalError?: any
    ) {
        super(message || getDefaultErrorMessage(code));
        this.name = 'AuthError';
    }
}

function getDefaultErrorMessage(code: AuthErrorCode): string {
    switch (code) {
        case AuthErrorCode.EMAIL_EXISTS:
            return 'An account with this email already exists';
        case AuthErrorCode.INVALID_EMAIL:
            return 'Please enter a valid email address';
        case AuthErrorCode.WEAK_PASSWORD:
            return 'Password should be at least 6 characters';
        case AuthErrorCode.USER_NOT_FOUND:
            return 'No account found with this email';
        case AuthErrorCode.WRONG_PASSWORD:
            return 'Incorrect password';
        case AuthErrorCode.POPUP_CLOSED:
            return 'Sign in was cancelled';
        case AuthErrorCode.ACCOUNT_EXISTS:
            return 'An account already exists with a different sign in method';
        case AuthErrorCode.INVALID_CREDENTIAL:
            return 'Invalid login credentials';
        case AuthErrorCode.OPERATION_NOT_ALLOWED:
            return 'This operation is not allowed';
        case AuthErrorCode.USER_DISABLED:
            return 'This account has been disabled';
        case AuthErrorCode.TOO_MANY_REQUESTS:
            return 'Too many attempts. Please try again later';
        case AuthErrorCode.REQUIRES_RECENT_LOGIN:
            return 'Please sign in again to complete this action';
        case AuthErrorCode.USER_DATA_NOT_FOUND:
            return 'User data not found';
        case AuthErrorCode.ROLE_UPDATE_FAILED:
            return 'Failed to update user role';
        case AuthErrorCode.STATUS_UPDATE_FAILED:
            return 'Failed to update user status';
        case AuthErrorCode.UNAUTHORIZED:
            return 'You are not authorized to perform this action';
        case AuthErrorCode.INVALID_ROLE:
            return 'Invalid user role';
        case AuthErrorCode.SERVER_ERROR:
            return 'Server error occurred';
        default:
            return 'An error occurred during authentication';
    }
}

export function handleAuthError(error: any): AuthError {
    if (error instanceof AuthError) {
        return error;
    }

    // Handle Firebase Auth errors
    if (error.code) {
        const code = error.code as AuthErrorCode;
        return new AuthError(code, undefined, error);
    }

    // Handle unknown errors
    console.error('Unknown authentication error:', error);
    return new AuthError(AuthErrorCode.SERVER_ERROR, undefined, error);
}

export function isAuthError(error: any): error is AuthError {
    return error instanceof AuthError;
}