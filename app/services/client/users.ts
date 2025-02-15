import { usersService } from '@/app/services/users';
import { User, UserDataResult, ExtendedUserMetadata } from '../../types/user';
import { User as FirebaseUser } from 'firebase/auth';

class ClientUsersService {
  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<User | null> {
    return usersService.createUserIfNotExists(firebaseUser);
  }

  async getUser(uid: string): Promise<User | null> {
    return usersService.getUser(uid);
  }

  async getCurrentUserData(firebaseUser: FirebaseUser): Promise<UserDataResult | null> {
    const userData = await this.createUserIfNotExists(firebaseUser);
    if (!userData) return null;

    const now = Date.now();
    return {
      user: userData,
      metadata: {
        lastLogin: userData.metadata?.lastLogin || now,
        createdAt: userData.metadata?.createdAt || now
      } as ExtendedUserMetadata
    };
  }
}

export const clientUsersService = new ClientUsersService();
