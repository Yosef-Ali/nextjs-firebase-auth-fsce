import { db } from '@/app/firebase';
import { User, UserRole, UserStatus } from '@/app/types/user';
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
  runTransaction,
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { Authorization } from '@/app/lib/authorization'; // Import Authorization class
import { auth } from '@/app/firebase';
import { sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { emailService } from './email';

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
        status: data.status || 'active', 
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

  async createOrUpdateUser(userId: string, data: Partial<User>, role?: 'user' | 'author' | 'admin'): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, userId);
      const now = Timestamp.now();

      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        // Create new user - require email only for new users
        if (!data.email) {
          throw new Error('Email is required for user creation');
        }
        await setDoc(userRef, {
          id: userId,
          role: role || 'user', // Use the role parameter here
          createdAt: now,
          updatedAt: now,
          ...data,
        });
      } else {
        // Update existing user - don't require email
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
    await this.createOrUpdateUser(userId, { role: 'admin' as UserRole });
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
      await this.createOrUpdateUser(userId, { status: 'suspended' as UserStatus });
      return true;
    } catch (error) {
      console.error('Error suspending user:', error);
      return false;
    }
  },

  async activateUser(userId: string): Promise<boolean> {
    try {
      await this.createOrUpdateUser(userId, { status: 'active' as UserStatus });
      return true;
    } catch (error) {
      console.error('Error activating user:', error);
      return false;
    }
  },

  async deleteUserById(userId: string): Promise<boolean> {
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

  async deleteUserByEmail(email: string): Promise<boolean> {
    try {
      console.log('Deleting user:', email);
      
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      const result = await response.json();
      return result.success;
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
          role: 'author' as UserRole,
          status: 'invited' as UserStatus,
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
        role: 'author' as UserRole,
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

  async inviteUser(
    inviterEmail: string,
    newUserEmail: string,
    role: 'user' | 'author' | 'admin'
  ): Promise<{ success: boolean, existingUser?: { email: string, role: string } }> {
    try {
      console.log('Starting invite process:', { inviterEmail, newUserEmail, role });

      // First check if user exists in Firestore
      const usersRef = collection(db, COLLECTION_NAME);
      const userQuery = query(usersRef, where('email', '==', newUserEmail));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const existingUserData = userSnapshot.docs[0].data();
        console.log('User already exists:', existingUserData);
        return {
          success: false,
          existingUser: {
            email: existingUserData.email,
            role: existingUserData.role
          }
        };
      }

      // Verify admin permissions
      const adminQuery = query(usersRef, where('email', '==', inviterEmail));
      const adminSnapshot = await getDocs(adminQuery);
      
      if (adminSnapshot.empty || adminSnapshot.docs[0].data().role !== 'admin') {
        console.error('Unauthorized: Not an admin user');
        return { success: false };
      }

      // Create user document with specified role
      const newUserRef = doc(collection(db, COLLECTION_NAME));
      const userData = {
        id: newUserRef.id,
        email: newUserEmail,
        role: role, // Ensure the correct role is set
        status: 'invited',
        invitedBy: inviterEmail,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log('Creating user document with role:', role);

      // Use a transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        // Double check user doesn't exist (in transaction)
        const userDoc = await transaction.get(doc(db, COLLECTION_NAME, newUserRef.id));
        if (userDoc.exists()) {
          throw new Error('User already exists');
        }

        // Create the user document with the role
        transaction.set(newUserRef, { ...userData });
      });

      // Send invitation email with the correct role
      console.log('Sending invitation email with role:', role);
      const emailSent = await emailService.sendInvitationEmail(newUserEmail, role);
      
      if (!emailSent) {
        // If email fails, delete the created document
        await deleteDoc(newUserRef);
        throw new Error('Failed to send invitation email');
      }

      console.log('Successfully invited user with role:', role);
      return { success: true };
    } catch (error) {
      console.error('Error in invite process:', error);
      return { success: false };
    }
  },

  async updateUserRole(
    adminEmail: string,
    userEmail: string,
    newRole: 'user' | 'author' | 'admin'
  ): Promise<boolean> {
    try {
      // Verify admin permissions
      const isAdmin = await this.isFSCEAdmin(adminEmail);
      if (!isAdmin) {
        throw new Error('Only administrators can update user roles');
      }

      // Find user by email
      const user = await this.findUserByEmail(userEmail);
      if (!user) {
        throw new Error('User not found');
      }

      // Don't update if role is the same
      if (user.role === newRole) {
        return true;
      }

      // Update role in database
      const userRef = doc(db, COLLECTION_NAME, user.id);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: Timestamp.now()
      });

      // Send role update notification for author and admin roles
      if (newRole === 'author' || newRole === 'admin') {
        await emailService.sendRoleUpdateEmail(userEmail, newRole);
      }

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
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
          if (userData.role !== 'admin' && userData.status !== 'invited') {
            batch.update(doc.ref, { 
              role: 'admin',
              updatedAt: Timestamp.now()
            });
          }
        } else {
          // If the user was previously an admin but is not in the admin list, 
          // reset their role to 'user' only if they are not invited
          if (userData.role === 'admin' && userData.status !== 'invited') {
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

  async isFSCEAdmin(email: string): Promise<boolean> {
    try {
      console.log('Checking admin status for email:', email);
      
      // Query users collection directly by email
      const usersRef = collection(db, COLLECTION_NAME);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No user found with email:', email);
        return false;
      }

      const userData = querySnapshot.docs[0].data();
      console.log('User data found:', userData);
      
      const isAdmin = userData.role === 'admin' && userData.status === 'active';
      console.log('Is admin?', isAdmin);
      
      return isAdmin;
    } catch (error) {
      console.error('Error checking FSCE admin status:', error);
      return false;
    }
  },

  async setFSCEAdminRole(
    currentAdminEmail: string,
    newAdminEmail: string
  ): Promise<boolean> {
    try {
      // Verify that the current user is an FSCE admin
      const isAdmin = await this.isFSCEAdmin(currentAdminEmail);
      if (!isAdmin) {
        throw new Error('Unauthorized: Only FSCE admins can assign admin roles');
      }

      // Find or create the new admin user
      const user = await this.findUserByEmail(newAdminEmail);
      
      if (user) {
        // Update existing user to admin role
        await this.updateUserRole(currentAdminEmail, newAdminEmail, 'admin');
      } else {
        // Invite new user as admin
        const result = await this.inviteUser(currentAdminEmail, newAdminEmail, 'admin');
        if (!result.success) {
          throw new Error('Failed to invite new admin user');
        }
      }

      // Send admin welcome email
      await emailService.sendInvitationEmail(newAdminEmail, 'admin');

      return true;
    } catch (error) {
      console.error('Error setting FSCE admin role:', error);
      return false;
    }
  },

  async getFSCEAdmins(): Promise<User[]> {
    try {
      const usersRef = collection(db, COLLECTION_NAME);
      const q = query(
        usersRef,
        where('role', '==', 'admin'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const admins: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        admins.push({
          id: doc.id,
          email: data.email,
          role: data.role,
          displayName: data.displayName,
          photoURL: data.photoURL,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
          status: data.status,
        } as User);
      });
      
      return admins;
    } catch (error) {
      console.error('Error getting FSCE admins:', error);
      return [];
    }
  },

  async removeFSCEAdminRole(
    currentAdminEmail: string,
    targetAdminEmail: string
  ): Promise<boolean> {
    try {
      // Verify that the current user is an FSCE admin
      const isAdmin = await this.isFSCEAdmin(currentAdminEmail);
      if (!isAdmin) {
        throw new Error('Unauthorized: Only FSCE admins can remove admin roles');
      }

      // Get all admins to ensure we're not removing the last admin
      const admins = await this.getFSCEAdmins();
      if (admins.length <= 1) {
        throw new Error('Cannot remove the last FSCE admin');
      }

      // Update the user role to regular user
      await this.updateUserRole(currentAdminEmail, targetAdminEmail, 'user');

      return true;
    } catch (error) {
      console.error('Error removing FSCE admin role:', error);
      return false;
    }
  },

  async setupInitialAdmin(email: string): Promise<boolean> {
    try {
      console.log('Setting up initial admin for:', email);
      
      // Create or update admin user document
      const usersRef = collection(db, COLLECTION_NAME);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new admin document
        const newUserRef = doc(collection(db, COLLECTION_NAME));
        await setDoc(newUserRef, {
          id: newUserRef.id,
          email: email,
          role: 'admin',
          status: 'active',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log('Created new admin user');
      } else {
        // Update existing user to admin
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          role: 'admin',
          status: 'active',
          updatedAt: Timestamp.now(),
        });
        console.log('Updated existing user to admin');
      }
      
      return true;
    } catch (error) {
      console.error('Error setting up initial admin:', error);
      return false;
    }
  },

  async deleteUser(email: string): Promise<boolean> {
    try {
      // Make API call to backend route that handles Firebase Auth deletion
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },
};
