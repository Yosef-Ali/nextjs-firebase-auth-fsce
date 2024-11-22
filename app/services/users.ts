import { db } from '@/app/firebase';
import { User } from '@/app/types/user';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

const COLLECTION_NAME = 'users';

export const usersService = {
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const data = userDoc.data();
      return {
        id: userDoc.id,
        email: data.email || '',
        role: data.role || 'user',
        displayName: data.displayName,
        photoURL: data.photoURL,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
      } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<void> {
    const { uid, email, displayName, photoURL } = firebaseUser;
    const userData = {
      ...(email && { email }),
      ...(displayName && { displayName }),
      ...(photoURL && { photoURL }),
    };
    await this.createOrUpdateUser(uid, userData);
  },

  async createUser(uid: string, { email, displayName, photoURL }: FirebaseUser) {
    if (!email) {
      throw new Error('Email is required for user creation');
    }
    
    const userData = {
      email,
      displayName: displayName || undefined,
      photoURL: photoURL || undefined,
    };
    await this.createOrUpdateUser(uid, userData);
  },

  async createOrUpdateUser(userId: string, data: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, userId);
      const now = Timestamp.now();
      
      if (!data.email) {
        throw new Error('Email is required for user creation');
      }
      
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        // Create new user
        await setDoc(userRef, {
          id: userId,
          role: 'user',
          createdAt: now,
          updatedAt: now,
          ...data,
        });
      } else {
        // Update existing user
        await setDoc(userRef, {
          ...userDoc.data(),
          ...data,
          updatedAt: now,
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  },

  async setAdminRole(userId: string): Promise<void> {
    await this.createOrUpdateUser(userId, { role: 'admin' });
  },
};
