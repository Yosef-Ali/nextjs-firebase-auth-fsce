import { usersService } from '@/app/services/users';
import { User, UserDataResult, UserRole, UserStatus, UserMetadata } from '../../types/user';
import { User as FirebaseUser } from 'firebase/auth';

// Common function to create user data with required fields
function createUserData(data: Partial<User>): User {
  const now = Date.now();
  return {
    uid: data.uid || '',
    email: data.email ?? '',
    displayName: data.displayName ?? '',
    photoURL: data.photoURL || null,
    role: data.role || UserRole.USER,
    status: data.status || UserStatus.ACTIVE,
    emailVerified: data.emailVerified || false,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    id: data.id || '',
    metadata: {
      lastLogin: data.metadata?.lastLogin || now,
      createdAt: data.metadata?.createdAt || now,
      role: data.metadata?.role || UserRole.USER,
      status: data.metadata?.status || UserStatus.ACTIVE,
      displayName: data.metadata?.displayName || null,
      email: data.metadata?.email || null,
      photoURL: data.metadata?.photoURL || null,
      uid: data.metadata?.uid || '',
      emailVerified: data.metadata?.emailVerified || false,
      providerData: data.metadata?.providerData || [],
      refreshToken: data.metadata?.refreshToken || '',
      phoneNumber: data.metadata?.phoneNumber || null,
      tenantId: data.metadata?.tenantId || null,
    },
    isAnonymous: data.isAnonymous || false,
    providerData: data.providerData || [],
    refreshToken: data.refreshToken || '',
    tenantId: data.tenantId || null,
    phoneNumber: data.phoneNumber || null,
    invitedBy: data.invitedBy || null,
    invitationToken: data.invitationToken || null
  };
}

class ClientUsersService {
  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<UserDataResult | null> {
    return usersService.createUserIfNotExists(firebaseUser) as unknown as UserDataResult;
  }

  async getUser(uid: string): Promise<User | null> {
    return usersService.getUser(uid);
  }
}

export const clientUsersService = new ClientUsersService();
