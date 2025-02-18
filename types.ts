import { Timestamp as FirebaseTimestamp } from 'firebase/firestore';

// Common timestamp type to ensure consistency
export type Timestamp = FirebaseTimestamp;

// Base interface for common fields
interface BaseModel {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Partner extends BaseModel {
  name: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  logo?: string;
  position: string;
  partnerType: 'partner' | 'membership';
  order: number;
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
  lastLogin: Timestamp;
  createdAt: Timestamp;
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

export interface User extends BaseModel {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  isAnonymous: boolean;
  invitedBy: string | null;
  invitationToken: string | null;
  metadata: UserMetadata;
  providerData: any[];
  refreshToken: string;
  phoneNumber: string | null;
  tenantId: string | null;
}

export interface Post extends BaseModel {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
  sticky: boolean;
  section?: string;
  images: string[];
  authorId: string;
  authorEmail: string;
  date: Timestamp;
  category: Category;
  featured: boolean;
  status?: PostStatus;
  author?: Author;
  tags: string[];
}

export interface Category extends BaseModel {
  name: string;
  slug: string;
  type: 'post' | 'resource' | 'award' | 'recognition';
  featured: boolean;
  description?: string;
  icon?: string;
}

export interface Author {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export type PostStatus = 'draft' | 'published' | 'archived';
