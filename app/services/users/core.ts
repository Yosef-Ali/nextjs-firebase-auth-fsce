import { db } from "@/lib/firebase/index";
import { doc, collection, getDocs, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { AppUser, UserRole, UserStatus } from "@/app/types/user";
import { User as FirebaseUser } from "firebase/auth";

class UserCoreService {
  private readonly usersCollection = 'users';

  async getAllUsers(): Promise<AppUser[]> {
    try {
      console.log('UserCoreService: Starting to fetch users...');
      const usersRef = collection(db, this.usersCollection);
      console.log('UserCoreService: Created collection reference');

      const querySnapshot = await getDocs(usersRef);
      console.log('UserCoreService: Got query snapshot, size:', querySnapshot.size);

      const users = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as AppUser));

      console.log('UserCoreService: Mapped users:', users);
      return users;
    } catch (error) {
      console.error('UserCoreService: Error fetching users:', error);
      throw this.handleError(error, 'Failed to fetch users');
    }
  }

  async getUser(userId: string): Promise<AppUser | null> {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      return {
        uid: userDoc.id,
        ...userDoc.data()
      } as AppUser;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch user');
    }
  }

  async getCurrentUser(firebaseUser: any | null): Promise<AppUser | null> {
    if (!firebaseUser?.uid) return null;
    return this.getUser(firebaseUser.uid);
  }

  async createOrUpdateUser(userId: string, userData: Partial<AppUser>): Promise<void> {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      const userDoc = await getDoc(userRef);

      const timestamp = new Date().toISOString();
      const data = {
        ...userData,
        updatedAt: timestamp,
        ...(userDoc.exists() ? {} : { createdAt: timestamp })
      };

      await setDoc(userRef, data, { merge: true });
    } catch (error) {
      throw this.handleError(error, 'Failed to create/update user');
    }
  }

  async updateUser(userId: string, userData: Partial<AppUser>): Promise<void> {
    try {
      // First verify the user exists
      const userRef = doc(db, this.usersCollection, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      // Remove undefined values to prevent Firebase errors
      const cleanedData = Object.entries(userData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Add timestamp
      cleanedData.updatedAt = new Date().toISOString();

      await updateDoc(userRef, cleanedData);
    } catch (error) {
      throw this.handleError(error, 'Failed to update user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      await deleteDoc(userRef);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete user');
    }
  }

  async setUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      await updateDoc(userRef, {
        role,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to update user role');
    }
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      await updateDoc(userRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to update user status');
    }
  }

  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    if (!firebaseUser?.uid) {
      return { success: false, error: "No user ID provided" };
    }
    try {
      const existingUser = await this.getUser(firebaseUser.uid);
      if (existingUser) {
        return { success: true, user: existingUser };
      }

      const userData: Partial<AppUser> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? "",
        displayName: firebaseUser.displayName ?? firebaseUser.email ?? "Unnamed User",
        photoURL: firebaseUser.photoURL ?? null,
        emailVerified: firebaseUser.emailVerified,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAnonymous: false,
        metadata: {
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          displayName: firebaseUser.displayName ?? "",
          email: firebaseUser.email ?? "",
          photoURL: firebaseUser.photoURL ?? null,
          uid: firebaseUser.uid,
          emailVerified: firebaseUser.emailVerified,
          providerData: firebaseUser.providerData,
          refreshToken: firebaseUser.refreshToken ?? "",
          phoneNumber: firebaseUser.phoneNumber,
          tenantId: firebaseUser.tenantId
        }
      };

      const userRef = doc(db, this.usersCollection, firebaseUser.uid);
      await setDoc(userRef, userData, { merge: true });
      const newUser = await this.getUser(firebaseUser.uid);

      if (!newUser) {
        return { success: false, error: "Failed to create user document" };
      }

      return { success: true, user: newUser };
    } catch (error) {
      console.error("Error in createUserIfNotExists:", error);
      return { success: false, error: String(error) };
    }
  }

  private handleError(error: unknown, defaultMessage: string): Error {
    console.error('UserCoreService error:', error);

    if (error instanceof Error) {
      return new Error(`${defaultMessage}: ${error.message}`);
    }

    return new Error(defaultMessage);
  }
}

export const userCoreService = new UserCoreService();
