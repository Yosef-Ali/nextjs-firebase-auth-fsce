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
    if (!firebaseUser?.uid) return null;

    try {
      const userRef = this.getUserRef(firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return await this.createUserIfNotExists(firebaseUser);
      }

      return userDoc.data() as User;
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

  async getAllUsers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      const snapshot = await getDocs(this.usersRef);
      const users = snapshot.docs
        .map((doc) => {
          try {
            return convertToAppUser({ ...doc.data(), uid: doc.id }) as User;
          } catch (error) {
            console.error(`Error mapping user document ${doc.id}:`, error);
            return null;
          }
        })
        .filter((user): user is User => user !== null);

      return { success: true, data: users };
    } catch (error) {
      console.error("Error getting all users:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch users"
      };
    }
  }

  async updateUserRole(uid: string, newRole: UserRole): Promise<void> {
    if (!uid) throw new Error("Valid user ID required");

    try {
      const userRef = this.getUserRef(uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error(`User with ID ${uid} not found`);
      }

      const currentData = userDoc.data() as User;

      // Prevent downgrading SUPER_ADMIN
      if (currentData.role === UserRole.SUPER_ADMIN && newRole !== UserRole.SUPER_ADMIN) {
        throw new Error("Cannot modify SUPER_ADMIN role");
      }

      await setDoc(userRef, {
        ...currentData,
        role: newRole,
        updatedAt: Date.now()
      }, { merge: true });
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
    if (!firebaseUser?.uid) {
      console.warn("No user ID provided to createUserIfNotExists");
      return null;
    }

    try {
      const userRef = this.getUserRef(firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      // Check if user already exists
      if (userDoc.exists()) {
        const existingData = userDoc.data() as User;

        // Update role if email is in admin list
        if (firebaseUser.email &&
          ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase()) &&
          existingData.role !== UserRole.SUPER_ADMIN &&
          existingData.role !== UserRole.ADMIN) {
          const updatedData = {
            ...existingData,
            role: UserRole.ADMIN,
            updatedAt: Date.now()
          };
          await setDoc(userRef, updatedData, { merge: true });
          return updatedData;
        }

        return existingData;
      }

      // Create new user
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Unnamed User",
        photoURL: firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified,
        role: firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())
          ? UserRole.ADMIN
          : UserRole.USER,
        status: UserStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
          lastLogin: Date.now(),
          createdAt: Date.now()
        }
      };

      // Create user document
      await setDoc(userRef, userData);
      return userData;
    } catch (error) {
      console.error('Error in createUserIfNotExists:', error);
      throw error;
    }
  }
}

export const userCoreService = new UserCoreService();