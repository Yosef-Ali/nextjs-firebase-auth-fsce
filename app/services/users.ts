import { db } from '@/app/firebase';
import { User } from '@/app/types/user';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  where,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { Authorization } from '@/app/lib/authorization'; // Import Authorization class

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

  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, COLLECTION_NAME);
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(userDoc => {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          email: data.email || '',
          role: data.role || 'user',
          displayName: data.displayName || '',
          photoURL: data.photoURL || '',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
          status: data.status || 'active', 
        } as User;
      });

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },

  async suspendUser(userId: string): Promise<boolean> {
    try {
      await this.createOrUpdateUser(userId, { status: 'suspended' });
      return true;
    } catch (error) {
      console.error('Error suspending user:', error);
      return false;
    }
  },

  async activateUser(userId: string): Promise<boolean> {
    try {
      await this.createOrUpdateUser(userId, { status: 'active' });
      return true;
    } catch (error) {
      console.error('Error activating user:', error);
      return false;
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // In a real-world scenario, you'd also want to:
      // 1. Delete user's authentication record
      // 2. Delete user's associated data
      // 3. Implement proper security rules
      await deleteDoc(doc(db, COLLECTION_NAME, userId));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  async resetUserPassword(email: string): Promise<boolean> {
    try {
      // This would typically be handled by Firebase Auth
      // You might want to use Firebase Auth's sendPasswordResetEmail method
      // Note: This is a placeholder and would need to be implemented with Firebase Auth
      console.log(`Password reset requested for ${email}`);
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  },

  async inviteAuthor(
    inviterEmail: string, 
    authorEmail: string
  ): Promise<{ success: boolean, token?: string }> {
    try {
      // Generate a unique invitation token
      const invitationToken = uuidv4();

      // Check if user already exists
      const usersRef = collection(db, COLLECTION_NAME);
      const q = query(usersRef, where('email', '==', authorEmail));
      const existingUserSnapshot = await getDocs(q);

      if (!existingUserSnapshot.empty) {
        // User already exists
        const existingUser = existingUserSnapshot.docs[0].data();
        if (existingUser.role === 'author') {
          return { success: false, token: undefined };
        }

        // Update existing user
        await this.createOrUpdateUser(existingUserSnapshot.docs[0].id, {
          role: 'author',
          status: 'invited',
          invitedBy: inviterEmail,
          invitationToken,
        });

        return { success: true, token: invitationToken };
      }

      // Create new invited author
      const newAuthorRef = doc(collection(db, COLLECTION_NAME));
      await setDoc(newAuthorRef, {
        id: newAuthorRef.id,
        email: authorEmail,
        role: 'author',
        status: 'invited',
        invitedBy: inviterEmail,
        invitationToken,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return { success: true, token: invitationToken };
    } catch (error) {
      console.error('Error inviting author:', error);
      return { success: false, token: undefined };
    }
  },

  async acceptAuthorInvitation(
    email: string, 
    invitationToken: string
  ): Promise<boolean> {
    try {
      const usersRef = collection(db, COLLECTION_NAME);
      const q = query(
        usersRef, 
        where('email', '==', email),
        where('invitationToken', '==', invitationToken)
      );
      
      const userSnapshot = await getDocs(q);
      
      if (userSnapshot.empty) {
        console.error('Invalid invitation');
        return false;
      }

      const userDoc = userSnapshot.docs[0];
      await setDoc(userDoc.ref, {
        ...userDoc.data(),
        status: 'active',
        invitationToken: null,
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Error accepting author invitation:', error);
      return false;
    }
  },

  async setAuthorRole(
    adminEmail: string, 
    userEmail: string
  ): Promise<boolean> {
    try {
      // Use Authorization to validate admin status
      const isAdmin = Authorization.getAdminEmails().includes(adminEmail);
      
      if (!isAdmin) {
        console.error('Unauthorized role change');
        return false;
      }

      // Find user by email and update role
      const usersRef = collection(db, COLLECTION_NAME);
      const q = query(usersRef, where('email', '==', userEmail));
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.error('User not found');
        return false;
      }

      const userDoc = querySnapshot.docs[0];
      await updateDoc(userDoc.ref, { role: 'author' });
      
      return true;
    } catch (error) {
      console.error('Error setting author role:', error);
      return false;
    }
  },

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = collection(db, COLLECTION_NAME);
      const q = query(usersRef, where('email', '==', email));
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      return {
        id: userDoc.id,
        email: userData.email || '',
        role: userData.role || 'user',
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toMillis() : Date.now(),
        updatedAt: userData.updatedAt instanceof Timestamp ? userData.updatedAt.toMillis() : Date.now(),
        status: userData.status || 'active',
      } as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  },

  async updateUserRoleBasedOnAdminEmails(): Promise<void> {
    try {
      const adminEmails = Authorization.getAdminEmails();
      const usersRef = collection(db, COLLECTION_NAME);
      
      // Query for all users
      const querySnapshot = await getDocs(usersRef);
      
      // Batch write to update multiple users
      const batch = writeBatch(db);

      querySnapshot.docs.forEach(doc => {
        const userData = doc.data();
        const userEmail = userData.email;

        // Check if the user's email is in the admin emails list
        if (adminEmails.includes(userEmail)) {
          // If the user is not already an admin, update their role
          if (userData.role !== 'admin') {
            batch.update(doc.ref, { 
              role: 'admin',
              updatedAt: Timestamp.now()
            });
          }
        } else {
          // If the user was previously an admin but is not in the admin list, 
          // reset their role to 'user'
          if (userData.role === 'admin') {
            batch.update(doc.ref, { 
              role: 'user',
              updatedAt: Timestamp.now()
            });
          }
        }
      });

      // Commit the batch
      await batch.commit();
      
      console.log('User roles updated based on admin emails');
    } catch (error) {
      console.error('Error updating user roles:', error);
    }
  },
};
