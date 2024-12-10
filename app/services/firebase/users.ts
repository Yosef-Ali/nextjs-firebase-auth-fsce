import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Query,
  WhereFilterOp,
  addDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface User {
  id: string;
  email: string;
  imageUrl: string;
  name: string;
  active: 'active' | 'inactive';
  role: 'user' | 'author';
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateUserInput {
  email: string;
  imageUrl: string;
  name: string;
  role?: 'user' | 'author';
}

export interface UpdateUserInput {
  imageUrl?: string;
  name?: string;
  active?: 'active' | 'inactive';
  role?: 'user' | 'author';
}

export interface CompleteUser extends Omit<User, 'email'>, Omit<AuthUser, 'uid'> {
  id: string;
  email: string;
  emailVerified: boolean;
}

class UserService {
  private readonly collectionName = 'users';

  async createUser(input: CreateUserInput): Promise<User> {
    const userRef = await addDoc(collection(db, this.collectionName), {
      ...input,
      role: input.role || 'user',
      active: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const userDoc = await getDoc(userRef);
    return { id: userDoc.id, ...userDoc.data() } as User;
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const userRef = doc(db, this.collectionName, id);
    await updateDoc(userRef, {
      ...input,
      updatedAt: serverTimestamp(),
    });

    const userDoc = await getDoc(userRef);
    return { id: userDoc.id, ...userDoc.data() } as User;
  }

  async deleteUser(id: string): Promise<void> {
    const userRef = doc(db, this.collectionName, id);
    await deleteDoc(userRef);
  }

  async getUserById(id: string): Promise<User | null> {
    const userRef = doc(db, this.collectionName, id);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    return { id: userDoc.id, ...userDoc.data() } as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(
      collection(db, this.collectionName),
      where('email', '==', email),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  }

  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  }

  async getActiveUsers(): Promise<User[]> {
    const q = query(
      collection(db, this.collectionName),
      where('active', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  }

  async getUsersByRole(role: 'user' | 'author'): Promise<User[]> {
    const q = query(
      collection(db, this.collectionName),
      where('role', '==', role)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  }

  async checkInvitation(token: string): Promise<{ email: string; role: string } | null> {
    const q = query(
      collection(db, this.collectionName),
      where('invitationToken', '==', token)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const invitationDoc = querySnapshot.docs[0];
    return {
      email: invitationDoc.data().email,
      role: invitationDoc.data().role,
    };
  }

  async acceptInvitation(token: string, email: string, password: string): Promise<boolean> {
    try {
      // First check if the invitation is valid
      const invitationDetails = await this.checkInvitation(token);
      if (!invitationDetails || invitationDetails.email !== email) {
        return false;
      }

      // Here you would typically:
      // 1. Create the user account if it doesn't exist
      // 2. Update the user's role based on the invitation
      // 3. Mark the invitation as used
      
      return true;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  }
}

export const userService = new UserService();
