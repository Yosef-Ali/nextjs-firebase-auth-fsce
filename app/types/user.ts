import { BaseModel } from './base';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  AUTHOR = 'AUTHOR',
  EDITOR = 'EDITOR',
  USER = 'USER',
  GUEST = 'GUEST'
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  BLOCKED = 'blocked',
  INACTIVE = 'inactive'
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

export interface User extends BaseModel {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  role: UserRole;
  status: UserStatus;
  metadata: UserMetadata;
  invitedBy: string | null;
  invitationToken: string | null;
  id: string;
  providerData?: any[];
  delete?: () => Promise<void>;
  getIdToken?: (forceRefresh?: boolean) => Promise<string>;
  getIdTokenResult?: (forceRefresh?: boolean) => Promise<any>;
  reload?: () => Promise<void>;
  toJSON?: () => object;
  refreshToken?: string;
  tenantId?: string | null;
  phoneNumber?: string | null;
}

export interface AppUser extends User {
  delete: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  getIdTokenResult: (forceRefresh?: boolean) => Promise<any>;
  reload: () => Promise<void>;
  toJSON: () => object;
  providerData: any[];
  refreshToken?: string;
}

export interface UserDataResult {
  success: boolean;
  user: User;
  error?: string;
}
