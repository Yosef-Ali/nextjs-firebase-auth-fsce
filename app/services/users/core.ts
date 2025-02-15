import { db } from "@/lib/firebase";
import { User, UserRole, UserStatus, UserMetadata } from "../../types/user";
import { convertToAppUser } from "../../utils/user-utils";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  DocumentReference,
} from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { deleteUser as deleteAuthUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Admin emails array
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'dev.yosef@gmail.com',
  'yaredd.degefu@gmail.com',
  'mekdesyared@gmail.com'
].filter(Boolean) as string[];

const USERS_COLLECTION = "users";

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
  metadata: {
    lastLogin: number;
    createdAt: number;
  };
}

class UserCoreService {
  readonly usersRef = collection(db, USERS_COLLECTION);

  private getUserRef(uid: string): DocumentReference {
    if (!uid?.trim()) {
      throw new Error("Valid User ID is required");
    }
    return doc(this.usersRef, uid);
  }

  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      const now = Date.now();

      // Check if user's email is in admin list
      const isAdmin = firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase());

      if (!userDoc.exists()) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified,
          role: isAdmin ? UserRole.ADMIN : UserRole.USER,
          status: UserStatus.ACTIVE,
          createdAt: now,
          updatedAt: now,
          invitedBy: null,
          invitationToken: null,
          metadata: {
            lastLogin: now,
            createdAt: now
          }
        };

        await setDoc(userRef, userData);
        return userData;
      }

      const existingUserData = userDoc.data() as User;

      // If user exists but is in admin list and not an admin, update their role
      if (isAdmin && existingUserData.role !== UserRole.ADMIN) {
        const updatedData = {
          ...existingUserData,
          role: UserRole.ADMIN,
          updatedAt: now,
          metadata: {
            ...existingUserData.metadata,
            lastLogin: now
          }
        };
        await updateDoc(userRef, updatedData);
        return updatedData;
      }

      // Update last login time
      await updateDoc(userRef, {
        'metadata.lastLogin': now,
        updatedAt: now
      });

      return {
        ...existingUserData,
        metadata: {
          ...existingUserData.metadata,
          lastLogin: now
        }
      };
    } catch (error) {
      console.error('Error in createUserIfNotExists:', error);
      return null;
    }
  }

  async getUser(uid: string): Promise<User | null> {
    try {
      const userRef = this.getUserRef(uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data() as User;
      return userData;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async createOrUpdateUser(
    uid: string,
    userData: Partial<User>
  ): Promise<void> {
    if (!uid?.trim()) {
      throw new Error("Valid User ID is required");
    }

    try {
      // Validate required fields
      if (!userData.email) {
        console.warn("No email provided for user creation/update");
      }

      const now = Date.now();
      const existingUser = await this.getUser(uid);
      const userRef = this.getUserRef(uid);

      const updatedData = {
        ...userData,
        uid, // Ensure UID is set in the document
        updatedAt: now,
        createdAt: existingUser?.createdAt || userData.createdAt || now,
        role: userData.role || existingUser?.role || UserRole.USER,
        status: userData.status || existingUser?.status || UserStatus.ACTIVE,
        metadata: {
          ...(existingUser?.metadata || {}),
          ...(userData.metadata || {}),
          lastLogin: userData.metadata?.lastLogin || now,
          createdAt: existingUser?.metadata?.createdAt || now
        }
      };

      await setDoc(userRef, updatedData, { merge: true });
    } catch (error) {
      console.error("Error creating/updating user:", error);
      throw error;
    }
  }

  async getCurrentUser(firebaseUser: FirebaseUser | null): Promise<User | null> {
    if (!firebaseUser?.uid) {
      console.warn("No Firebase user provided to getCurrentUser");
      return null;
    }

    try {
      return await this.getUser(firebaseUser.uid);
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  }

  async updateUserStatus(uid: string, status: UserStatus): Promise<void> {
    if (!uid?.trim()) {
      throw new Error("Valid User ID is required");
    }

    try {
      const userRef = this.getUserRef(uid);
      const existingUser = await this.getUser(uid);

      if (!existingUser) {
        throw new Error(`User with ID ${uid} not found`);
      }

      await updateDoc(userRef, {
        status,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const snapshot = await getDocs(this.usersRef);
      const users = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            ...data,
            uid: doc.id
          } as User;
        })
        .filter((user): user is User => user !== null);

      return users;
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async updateUserRole(uid: string, role: UserRole): Promise<{ success: boolean; error?: string; details?: any }> {
    if (!uid?.trim()) {
      return {
        success: false,
        error: "Valid User ID is required"
      };
    }

    try {
      const userRef = this.getUserRef(uid);
      const existingUser = await this.getUser(uid);

      if (!existingUser) {
        return {
          success: false,
          error: `User with ID ${uid} not found`
        };
      }

      await updateDoc(userRef, {
        role,
        updatedAt: Date.now()
      });

      return {
        success: true,
        details: {
          uid,
          previousRole: existingUser.role,
          newRole: role
        }
      };
    } catch (error) {
      console.error("Error updating user role:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update user role"
      };
    }
  }

  async deleteUser(uid: string): Promise<{ success: boolean; error?: string; details?: any }> {
    if (!uid?.trim()) {
      return {
        success: false,
        error: "Valid User ID is required",
        details: { uid }
      };
    }

    try {
      const userRef = this.getUserRef(uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          error: `User document not found for ID: ${uid}`,
          details: { uid }
        };
      }

      // Delete from Firestore first
      await deleteDoc(userRef);

      return { success: true };
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete user",
        details: { uid }
      };
    }
  }

  async getUserData(user: FirebaseUser): Promise<UserData | null> {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data() as UserData : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  async createUserData(
    user: FirebaseUser,
    displayName: string,
    role: UserRole = UserRole.USER
  ): Promise<UserData> {
    const timestamp = Date.now();
    const userData: UserData = {
      uid: user.uid,
      email: user.email || '',
      displayName,
      role,
      status: UserStatus.PENDING,
      createdAt: timestamp,
      updatedAt: timestamp,
      metadata: {
        lastLogin: timestamp,
        createdAt: timestamp
      }
    };
    await setDoc(doc(db, 'users', user.uid), userData);
    return userData;
  }

  async updateUserMetadata(uid: string, metadata: Partial<UserMetadata>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...metadata,
      updatedAt: Date.now()
    });
  }
}

export const userCoreService = new UserCoreService();