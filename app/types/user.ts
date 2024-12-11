// Importing necessary types
import { User as FirebaseUser } from 'firebase/auth';

// Enum for user roles
export enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  INVITED = 'invited'
}

// Base interface for user metadata
export interface UserMetadata {
  uid: string;
  email: string | null;  // Changed to match FirebaseUser type
  role: UserRole;
  displayName: string | null;
  photoURL: string | null;
  metadata: {
    lastLogin: number;
    createdAt: number;
  };
}

// Custom User type
export interface User {
  uid: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  updatedAt: number;
  invitedBy: string | null;
  invitationToken: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData: any[];
}

// Extended user interface that includes an id field
export interface ExtendedUser extends User {
  id: string;
}

// Interface for updating user data
export interface UserUpdateData {
  role?: UserRole;
  status?: UserStatus;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

export interface UserDataResult {
  uid: string;
  role: UserRole;
  metadata?: {
    createdAt?: number;
    lastLogin?: number;
  };
}
