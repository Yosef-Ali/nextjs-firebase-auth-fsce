import { User as FirebaseUser, UserMetadata as FirebaseUserMetadata } from 'firebase/auth';

// Enum for user roles with clear hierarchy
export enum UserRole {
  SUPER_ADMIN = 'super_admin',  // Has full system access
  ADMIN = 'admin',              // Has administrative access
  AUTHOR = 'author',            // Can manage content
  EDITOR = 'editor',            // Can edit content
  USER = 'user',               // Basic authenticated user
  GUEST = 'guest'              // Unauthenticated user
}

// User status enum
export enum UserStatus {
  ACTIVE = 'active',           // User is active and can access the system
  INACTIVE = 'inactive',       // User account is temporarily disabled
  PENDING = 'pending',         // Awaiting email verification or approval
  BLOCKED = 'blocked'          // User access has been revoked
}

// Base interface for user metadata
export interface UserMetadata {
  uid: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  displayName: string | null;
  photoURL: string | null;
  metadata: {
    lastLogin: number;
    createdAt: number;
  };
}

// Base serializable user interface
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
  invitedBy: string | null;
  invitationToken: string | null;
  emailVerified: boolean;
  metadata: {
    lastLogin: number;
    createdAt: number;
  };
}

// Extended metadata interface that includes both Firebase and custom fields
export interface ExtendedUserMetadata extends FirebaseUserMetadata {
  lastLogin: number;
  createdAt: number;
}

// Custom AppUser type that extends FirebaseUser
export interface AppUser extends FirebaseUser {
  role: UserRole;
  status: UserStatus;
  createdAt?: number;
  updatedAt?: number;
  invitedBy?: string | null;
  invitationToken?: string | null;
  metadata: ExtendedUserMetadata;
}

// Extended user interface that includes an id field
export interface ExtendedAppUser extends AppUser {
  id: string;
}

// Interface for updating user data
export interface AppUserUpdateData {
  role?: UserRole;
  status?: UserStatus;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

// Result type for user data operations
export interface UserDataResult {
  user: User;
  metadata: ExtendedUserMetadata;
}
