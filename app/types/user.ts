export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  EDITOR = 'editor',
  USER = 'user'
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  INVITED = 'invited',
  SUSPENDED = 'suspended',
  ACTIVE = 'active'
}

export interface UserMetadata {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
  invitedBy?: string;
  invitationToken?: string | null;
}

export type User = UserMetadata;
