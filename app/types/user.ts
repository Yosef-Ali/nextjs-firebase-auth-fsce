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

import { User as FirebaseUser } from 'firebase/auth';

// Base user interface that matches our Firestore user document
export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
  status: UserStatus;
  invitedBy?: string;
  invitationToken?: string | null;
}

// Extended user interface that includes Firebase auth fields
export interface UserMetadata extends Omit<User, 'uid'> {
  uid: string;  // Keep uid as the primary identifier
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata?: {
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
