import { User as FirebaseUser, UserCredential } from 'firebase/auth';
import { UserMetadata, AppUser } from './user';

// Auth-specific error codes
export type AuthErrorCodes =
    | 'auth/invalid-email'
    | 'auth/user-disabled'
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/email-already-in-use'
    | 'auth/weak-password'
    | 'auth/operation-not-allowed'
    | 'auth/popup-closed-by-user'
    | 'auth/cancelled-popup-request'
    | 'auth/popup-blocked';

// Auth context interface
export interface AuthContextType {
    user: AppUser | null;
    userData: UserMetadata | null;
    loading: boolean;
    error: Error | null;
    signIn: (email: string, password: string) => Promise<UserMetadata>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ userCredential: UserCredential; userData: UserMetadata }>;
    signUp: (email: string, password: string, displayName: string) => Promise<{ userCredential: UserCredential; userData: UserMetadata }>;
    resetPassword: (email: string) => Promise<void>;
}

// JWT payload structure
export interface JwtPayload {
    sub: string;          // Subject (user ID)
    email: string;
    role: string;
    status: string;
    email_verified: boolean;
    iat: number;         // Issued at
    exp: number;         // Expiration time
}
