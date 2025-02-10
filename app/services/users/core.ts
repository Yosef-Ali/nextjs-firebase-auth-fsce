import { db } from "@/lib/firebase";
import { User, UserRole, UserStatus } from "../../types/user";
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

class UserCoreService {
  readonly usersRef = collection(db, USERS_COLLECTION);

  private getUserRef(uid: string): DocumentReference {
    if (!uid?.trim()) {
      throw new Error("Valid User ID is required");
    }
    return doc(this.usersRef, uid);
  }

  async getUser(uid: string): Promise<User | null> {
    if (!uid?.trim()) {
      console.warn("Invalid user ID provided to getUser");
      return null;
    }

    try {
      const userDoc = await getDoc(this.getUserRef(uid));
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      const user = convertToAppUser({ ...data, uid: userDoc.id });
      return user as User;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
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
      return snapshot.docs
        .map((doc) => {
          try {
            return convertToAppUser({ ...doc.data(), uid: doc.id }) as User;
          } catch (error) {
            console.error(`Error mapping user document ${doc.id}:`, error);
            return null;
          }
        })
        .filter((user): user is User => user !== null);
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
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
        role,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
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

  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Check if user's email is in admin list
        const isAdmin = firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email);

        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || null,
          role: isAdmin ? UserRole.ADMIN : UserRole.USER,
          status: UserStatus.ACTIVE,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        await setDoc(userRef, userData);
        return userData;
      }

      const existingUserData = userDoc.data() as User;

      // If user exists but is in admin list and not an admin, update their role
      if (firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email) && existingUserData.role !== UserRole.ADMIN) {
        const updatedData = {
          ...existingUserData,
          role: UserRole.ADMIN,
          updatedAt: Date.now()
        };
        await updateDoc(userRef, updatedData);
        return updatedData;
      }

      return existingUserData;
    } catch (error) {
      console.error('Error in createUserIfNotExists:', error);
      return null;
    }
  }
}

export const userCoreService = new UserCoreService();