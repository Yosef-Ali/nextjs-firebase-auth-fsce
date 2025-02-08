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
  DocumentReference,
} from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";

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
}

export const userCoreService = new UserCoreService();