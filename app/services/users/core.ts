import { db } from "@/lib/firebase";
import { doc, collection, getDocs, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { AppUser, UserRole } from "@/app/types/user";

class UserCoreService {
  private readonly usersCollection = 'users';

  async getAllUsers(): Promise<AppUser[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.usersCollection));
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as AppUser));
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch users');
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
      cleanedData.updatedAt = new Date();

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
        updatedAt: new Date()
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to update user role');
    }
  }

  private handleError(error: unknown, defaultMessage: string): Error {
    console.error('UserCoreService error:', error);
    
    if (error instanceof Error) {
      // If it's already an Error instance, add context if needed
      return new Error(`${defaultMessage}: ${error.message}`);
    }
    
    // If it's not an Error instance, create a new one with the default message
    return new Error(defaultMessage);
  }
}

export const userCoreService = new UserCoreService();
