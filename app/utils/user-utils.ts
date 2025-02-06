import { User } from 'firebase/auth';
import { AppUser, UserRole, UserStatus } from '@/app/types/user';

// Only include serializable properties
type SerializableUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  metadata: {
    lastLogin: number;
    createdAt: number;
  };
  invitedBy?: string | null;
  invitationToken?: string | null;
  createdAt?: number;
  updatedAt?: number;
};

export const convertToAppUser = (user: any): SerializableUser => {
  // Extract only serializable properties
  const serializableUser: SerializableUser = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    role: user.role || UserRole.USER,
    status: user.status || UserStatus.ACTIVE,
    emailVerified: user.emailVerified || false,
    metadata: {
      lastLogin: typeof user.lastLogin === 'number' ? user.lastLogin :
                 user.metadata?.lastLogin || Date.now(),
      createdAt: typeof user.createdAt === 'number' ? user.createdAt :
                 user.metadata?.createdAt || Date.now()
    }
  };

  // Add optional fields only if they exist
  if (user.invitedBy) serializableUser.invitedBy = user.invitedBy;
  if (user.invitationToken) serializableUser.invitationToken = user.invitationToken;
  if (user.createdAt) serializableUser.createdAt = user.createdAt;
  if (user.updatedAt) serializableUser.updatedAt = user.updatedAt;

  return serializableUser;
};
