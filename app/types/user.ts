// Importing necessary types
import { User as FirebaseUser } from 'firebase/auth';

// Enum for user roles
export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  EDITOR = 'editor',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  INVITED = 'invited'
}

// Custom User type that extends Firebase User
export interface User extends FirebaseUser {
  role: UserRole;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  updatedAt: number;
  status: UserStatus;
  invitedBy: string | null;
  invitationToken: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData: {
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
  }[];
}

// Extended user interface that includes Firebase auth fields
export interface UserMetadata {
  uid: string;  // Keep uid as the primary identifier
  role: UserRole;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  updatedAt: number;
  status: UserStatus;
  invitedBy: string | null;
  invitationToken: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData?: {
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
  }[];
  metadata: {
    lastLogin: number;
    createdAt: number;
  };
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
