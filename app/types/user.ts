import { BaseModel } from './base';

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  EDITOR = "EDITOR"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  DELETED = "DELETED",
  SUSPENDED = "SUSPENDED"
}

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;  // Changed from optional to required
  photoURL: string | null;  // Made nullable but required
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  phoneNumber: string | null;  // Made nullable but required
  tenantId: string | null;  // Made nullable but required
  providerData: any[];  // Made required
  refreshToken: string | null;  // Made nullable but required
  invitedBy: string | null;  // Made nullable but required
  invitationToken: string | null;  // Made nullable but required
  metadata?: {
    lastLogin: number;
    createdAt: number;
    role: UserRole;
    status: UserStatus;
  };
}

export interface AppUser extends User {
  delete: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  getIdTokenResult: (forceRefresh?: boolean) => Promise<any>;
  reload: () => Promise<void>;
  toJSON: () => object;
}

export interface UserMetadata {
  lastLogin: number;
  createdAt: number;
  role: UserRole;
  status: UserStatus;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
  emailVerified: boolean;
  providerData?: any[];
  refreshToken?: string;
  phoneNumber?: string | null;
  tenantId?: string | null;
}

export interface UserDataResult {
  success: boolean;
  user: User;
  error?: string;
}
