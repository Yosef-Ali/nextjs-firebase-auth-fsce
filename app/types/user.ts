// Importing necessary types
import { User as FirebaseUser } from 'firebase/auth';

// Enum for user roles
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
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
  status: UserStatus;  // Add this line
  displayName: string | null;
  photoURL: string | null;
  metadata: {
    lastLogin: number;
    createdAt: number;
  };
}

// Custom AppUser type
export interface AppUser extends FirebaseUser {
  // Add your custom properties here
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
  invitedBy: string | null;
  invitationToken: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData: any[];
}

// Extended user interface that includes an id field
export interface ExtendedAppUser extends AppUser {  // Updated to 'ExtendedAppUser'
  id: string;
}

// Interface for updating user data
export interface AppUserUpdateData {  // Updated to 'AppUserUpdateData'
  role?: UserRole;
  status?: UserStatus;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

export interface UserDataResult {
  uid: string;
  role: UserRole;
  status: UserStatus; // Add this line
  metadata?: {
    createdAt?: number;
    lastLogin?: number;
  };
}

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
  invitedBy: string | null;
  invitationToken: string | null;
  metadata: {
    lastLogin: number;
    createdAt: number;
  };
}

const userMetadata: UserMetadata = {
  uid: 'some-uid',
  email: 'user@example.com',
  role: UserRole.MEMBER, // Add the status property
  status: UserStatus.ACTIVE, 
  displayName: 'User Name',
  photoURL: null,
  metadata: {
    lastLogin: Date.now(),
    createdAt: Date.now(),
  },
};
