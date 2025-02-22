import { User as FirebaseUser } from 'firebase/auth';

export type AuthState = {
    user: FirebaseUser | null;
    loading: boolean;
};

// Renamed from AuthError to avoid conflict
export interface FirebaseAuthError {
    code: string;
    message: string;
}

export interface AuthResponse {
    success: boolean;
    user?: FirebaseUser;
    error?: FirebaseAuthError;
}

// Simplified user roles
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}

// Basic user status
export enum UserStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    BLOCKED = 'blocked'
}