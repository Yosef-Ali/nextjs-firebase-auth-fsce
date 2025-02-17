export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  logo?: string;
  position: string;
  partnerType: 'partner' | 'membership';
  order: number;
  createdAt: Date | number;
  updatedAt: Date | number;
}

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  PENDING = "PENDING",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  INVITED = "INVITED",
  REJECTED = "REJECTED",
  BANNED = "BANNED",
}

export interface UserMetadata {
  lastLogin: number;
  createdAt: number;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  email: string;
  photoURL: string | null;
  uid: string;
  emailVerified: boolean;
  providerData: any[];
  refreshToken: string;
  phoneNumber: string | null;
  tenantId: string | null;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  isAnonymous: boolean;
  id: string;
  createdAt: number;
  updatedAt: number;
  invitedBy: string | null;
  invitationToken: string | null;
  metadata: UserMetadata;
  providerData: any[];
  refreshToken: string;
  phoneNumber: string | null;
  tenantId: string | null;
}
