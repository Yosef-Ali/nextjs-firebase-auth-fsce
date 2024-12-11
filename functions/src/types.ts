import { Timestamp } from 'firebase-admin/firestore';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended';

export interface User {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateUserData = Omit<User, 'createdAt' | 'updatedAt'>;
export type UpdateUserData = Partial<Omit<User, 'uid' | 'createdAt' | 'updatedAt'>>;

export interface UserOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}
