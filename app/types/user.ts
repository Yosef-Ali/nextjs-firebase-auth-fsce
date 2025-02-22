export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  AUTHOR = 'author',
  EDITOR = 'editor',
  USER = 'user',
  GUEST = 'guest'
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
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
  providerData: any[];
  refreshToken: string;
  phoneNumber: string | null;
  tenantId: string | null;
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  isAnonymous: boolean;
  id: string;
  createdAt: string;
  updatedAt: string;
  invitedBy: string | null;
  invitationToken: string | null;
  metadata?: UserMetadata;
  providerData: any[];
  refreshToken: string;
  phoneNumber: string | null;
  tenantId: string | null;
}
