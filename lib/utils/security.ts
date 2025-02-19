import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authLogger } from './auth-logger';

interface SecurityCheckResult {
    isValid: boolean;
    error?: string;
}

const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_TOKEN_AGE = 60 * 60 * 1000; // 1 hour

export const securityUtils = {
    validateTokenClaims: async (user: User | null): Promise<SecurityCheckResult> => {
        if (!user) {
            return { isValid: false, error: 'No user found' };
        }

        try {
            const token = await user.getIdTokenResult();

            // Check token expiration
            const tokenExpirationTime = new Date(token.expirationTime).getTime();
            if (Date.now() >= tokenExpirationTime) {
                return { isValid: false, error: 'Token expired' };
            }

            // Check token age
            const tokenIssuedTime = new Date(token.issuedAtTime).getTime();
            const tokenAge = Date.now() - tokenIssuedTime;

            if (tokenAge > MAX_TOKEN_AGE) {
                return { isValid: false, error: 'Token too old' };
            }

            // Verify auth time is recent
            const authTime = new Date(token.authTime).getTime();
            const authAge = Date.now() - authTime;

            if (authAge > MAX_TOKEN_AGE) {
                return { isValid: false, error: 'Auth time too old' };
            }

            return { isValid: true };
        } catch (error) {
            authLogger.error('Token validation error:', error);
            return { isValid: false, error: 'Token validation failed' };
        }
    },

    validateAuthState: async (user: User | null): Promise<SecurityCheckResult> => {
        if (!user) {
            return { isValid: false, error: 'No user found' };
        }

        try {
            // Check if user's email is verified when required
            if (process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true' && !user.emailVerified) {
                return { isValid: false, error: 'Email not verified' };
            }

            // Force token refresh if it's older than refresh interval
            const tokenResult = await user.getIdTokenResult();
            const tokenAge = Date.now() - new Date(tokenResult.issuedAtTime).getTime();

            if (tokenAge > TOKEN_REFRESH_INTERVAL) {
                await user.getIdToken(true); // Force refresh
            }

            // Verify the user hasn't been disabled
            if (user.disabled) {
                return { isValid: false, error: 'User account is disabled' };
            }

            return { isValid: true };
        } catch (error) {
            authLogger.error('Auth state validation error:', error);
            return { isValid: false, error: 'Failed to validate auth state' };
        }
    },

    sanitizeUserData: (userData: any): Partial<User> => {
        const safeFields = ['uid', 'email', 'displayName', 'photoURL', 'emailVerified', 'metadata'];
        const sanitized = Object.fromEntries(
            Object.entries(userData).filter(([key]) => safeFields.includes(key))
        );

        // Remove any potential XSS in strings
        Object.entries(sanitized).forEach(([key, value]) => {
            if (typeof value === 'string') {
                sanitized[key] = value.replace(/<[^>]*>/g, '');
            }
        });

        return sanitized;
    },

    async refreshUserSession(): Promise<boolean> {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                return false;
            }

            await currentUser.getIdToken(true);
            return true;
        } catch (error) {
            authLogger.error('Session refresh failed:', error);
            return false;
        }
    }
};