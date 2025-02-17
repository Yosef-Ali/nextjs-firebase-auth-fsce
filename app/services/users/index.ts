import { User as FirebaseUser } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, UserRole, UserStatus } from '@/app/types/user';

class UsersService {
  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data() as User;
      }

      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await setDoc(userRef, newUser);
      return newUser;
    } catch (error) {
      console.error('Error in createUserIfNotExists:', error);
      return null;
    }
  }
}

export const usersService = new UsersService();
