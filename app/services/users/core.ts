import { db } from "@/lib/firebase";
import { User, UserRole, UserStatus } from "../../types/user";
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
import { createUserObject } from "../../utils/user-utils";

const USERS_COLLECTION = "users";

class UserCoreService {
  readonly usersRef = collection(db, USERS_COLLECTION);

  private createUserObject(
    uid: string,
    data: Partial<User> & { metadata?: any }
  ): User {
    return createUserObject(uid, data);
  }

  private getUserRef(uid: string): DocumentReference {
    return doc(this.usersRef, uid);
  }

  async getUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(this.getUserRef(uid));
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      return this.createUserObject(uid, data);
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async getCurrentUser(firebaseUser: FirebaseUser | null): Promise<User | null> {
    try {
      if (!firebaseUser) {
        return null;
      }

      // Get the user data from Firestore
      const userDoc = await getDoc(this.getUserRef(firebaseUser.uid));
      if (!userDoc.exists()) {
        return null;
      }

      return this.createUserObject(firebaseUser.uid, userDoc.data());
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async createOrUpdateUser(
    uid: string,
    userData: Partial<User>
  ): Promise<void> {
    try {
      const userRef = this.getUserRef(uid);
      await setDoc(
        userRef,
        {
          ...userData,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error creating/updating user:", error);
      throw error;
    }
  }

  async updateUserStatus(uid: string, status: UserStatus): Promise<void> {
    try {
      const userRef = this.getUserRef(uid);
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
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return this.createUserObject(doc.id, data) as User;
      });
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    try {
      const userRef = this.getUserRef(uid);
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