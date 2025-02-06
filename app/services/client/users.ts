import { usersService } from '@/app/services/users';
import { User, UserDataResult } from '../../types/user';
import { User as FirebaseUser } from 'firebase/auth';

class ClientUsersService {
  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<UserDataResult | null> {
    return usersService.createUserIfNotExists(firebaseUser);
  }

  async getUser(uid: string): Promise<User | null> {
    return usersService.getUser(uid);
  }
}

export const clientUsersService = new ClientUsersService();
