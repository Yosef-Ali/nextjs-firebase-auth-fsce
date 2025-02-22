import { adminAuth, adminDb } from "../lib/firebase-admin"
import { type User, UserRole, UserStatus, UserMetadata } from "../types/user"
import { emailService } from "./email"
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

// Helper function to create a user with required fields
function createUserWithDefaults(data: Partial<User>): User {
  const now = Date.now();
  return {
    uid: data.uid || '',
    email: data.email || '',  // Changed from null to empty string
    displayName: data.displayName || '',  // Changed from null to empty string
    photoURL: data.photoURL || null,
    role: data.role || UserRole.USER,
    status: data.status || UserStatus.ACTIVE,
    emailVerified: data.emailVerified || false,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    isAnonymous: false,
    id: data.uid || '',  // Added id field
    metadata: {
      lastLogin: data.metadata?.lastLogin || now,
      createdAt: data.metadata?.createdAt || now,
      role: data.role || UserRole.USER,
      status: data.status || UserStatus.ACTIVE,
      displayName: data.displayName || '',
      email: data.email || '',
      photoURL: data.photoURL || null,
      uid: data.uid || '',
      emailVerified: data.emailVerified || false,
      providerData: data.providerData || [],
      refreshToken: data.refreshToken,
      phoneNumber: data.phoneNumber || null,
      tenantId: data.tenantId || null
    },
    providerData: [],
    refreshToken: data.refreshToken,
    tenantId: data.tenantId || null,
    phoneNumber: data.phoneNumber || null,
    invitedBy: data.invitedBy || null,
    invitationToken: data.invitationToken || null
  };
}

export class UsersService {
  private usersCollection = adminDb.collection("users")

  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      const userRef = this.usersCollection.doc(firebaseUser.uid)
      const userDoc = await userRef.get()
      const now = Date.now();

      if (!userDoc.exists) {
        const { customClaims } = await adminAuth.getUser(firebaseUser.uid)
        const role = customClaims?.role || UserRole.USER

        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || null,
          role,
          status: UserStatus.ACTIVE,
          isAnonymous: false,
          id: firebaseUser.uid,
          emailVerified: firebaseUser.emailVerified,
          createdAt: now,
          updatedAt: now,
          invitedBy: null,
          invitationToken: null,
          metadata: {
            lastLogin: now,
            createdAt: now,
            role,
            status: UserStatus.ACTIVE,
            displayName: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || null,
            uid: firebaseUser.uid,
            emailVerified: firebaseUser.emailVerified,
            providerData: firebaseUser.providerData,
            refreshToken: firebaseUser.refreshToken,
            phoneNumber: firebaseUser.phoneNumber,
            tenantId: firebaseUser.tenantId
          }
        };

        await adminAuth.setCustomUserClaims(firebaseUser.uid, { role })
        await userRef.set(userData)

        return userData;
      }

      const existingUserData = userDoc.data() as User;
      // Ensure role is synced with custom claims
      const { customClaims } = await adminAuth.getUser(firebaseUser.uid)
      if (customClaims?.role && existingUserData && customClaims.role !== existingUserData.role) {
        const updatedData = {
          ...existingUserData,
          role: customClaims.role,
          updatedAt: now,
          metadata: {
            ...existingUserData.metadata,
            role: customClaims.role
          }
        };
        await userRef.update(updatedData);
        return updatedData;
      }

      return existingUserData;
    } catch (error) {
      console.error("Error in createUserIfNotExists:", error)
      return null
    }
  }

  async getUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await this.usersCollection.doc(uid).get()
      if (!userDoc.exists) return null
      return this.mapUser({ id: uid, ...userDoc.data() })
    } catch (error) {
      console.error("Error getting user:", error)
      return null
    }
  }

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    try {
      await this.usersCollection.doc(uid).update({
        role,
        updatedAt: Timestamp.fromMillis(Date.now()),
      })
      await adminAuth.setCustomUserClaims(uid, { role })
    } catch (error) {
      console.error("Error updating user role:", error)
      throw error
    }
  }

  async deleteUser(uid: string): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      // First verify the user exists in Firestore
      const userDoc = await this.usersCollection.doc(uid).get();
      if (!userDoc.exists) {
        return {
          success: false,
          error: `User document not found for ID: ${uid}`,
          details: { uid }
        };
      }

      // Delete from Authentication first
      try {
        await adminAuth.deleteUser(uid);
      } catch (authError) {
        console.error("Error deleting user from Authentication:", authError);
        return {
          success: false,
          error: authError instanceof Error ? authError.message : "Failed to delete user from Authentication",
          details: { uid, authError }
        };
      }

      // If Authentication deletion was successful, delete from Firestore
      await this.usersCollection.doc(uid).delete();
      return {
        success: true,
        details: {
          uid,
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
      };
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete user",
        details: { uid, error }
      };
    }
  }

  async resetUserPassword(email: string): Promise<void> {
    try {
      // Generate password reset link
      await adminAuth.generatePasswordResetLink(email);
    } catch (error) {
      console.error("Error generating password reset link:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to reset password");
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const snapshot = await this.usersCollection.get()
      return snapshot.docs.map((doc) => this.mapUser({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error("Error getting all users:", error)
      return []
    }
  }

  async inviteUser(
    adminEmail: string,
    targetEmail: string,
    role: UserRole,
  ): Promise<{ success: boolean; existingUser?: { email: string; role: string } }> {
    try {
      const existingUserQuery = await this.usersCollection.where("email", "==", targetEmail).get()

      if (!existingUserQuery.empty) {
        const existingUserDoc = existingUserQuery.docs[0]
        const existingUserData = existingUserDoc.data()
        return {
          success: false,
          existingUser: {
            email: existingUserData.email,
            role: existingUserData.role,
          },
        }
      }

      const invitationToken = Math.random().toString(36).substring(2, 15)

      const newUserData = {
        email: targetEmail,
        role,
        status: UserStatus.PENDING,
        invitedBy: adminEmail,
        invitationToken,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const newUserRef = await this.usersCollection.add(newUserData)

      // Fix: remove the role parameter as it's not expected by sendInvitationEmail
      const emailSent = await emailService.sendInvitationEmail(targetEmail)
      if (!emailSent) {
        await newUserRef.delete()
        throw new Error("Failed to send invitation email")
      }

      return { success: true }
    } catch (error) {
      console.error("Error inviting user:", error)
      throw error
    }
  }

  private mapUser(data: any): User {
    const now = Date.now();
    return {
      uid: data.id,
      email: data.email || '',
      displayName: data.displayName || '',
      photoURL: data.photoURL || null,
      role: data.role || UserRole.USER,
      status: data.status || UserStatus.ACTIVE,
      isAnonymous: false,
      id: data.id,
      emailVerified: data.emailVerified ?? false,
      createdAt: new Date(data.createdAt).getTime(),
      updatedAt: new Date(data.updatedAt).getTime(),
      invitedBy: data.invitedBy || null,
      invitationToken: data.invitationToken || null,
      metadata: {
        lastLogin: data.metadata?.lastLogin || now,
        createdAt: data.metadata?.createdAt || now,
        role: data.role || UserRole.USER,
        status: data.status || UserStatus.ACTIVE,
        displayName: data.displayName || '',
        email: data.email || '',
        photoURL: data.photoURL || null,
        uid: data.id,
        emailVerified: data.emailVerified ?? false,
        providerData: data.providerData || [],
        refreshToken: data.refreshToken,
        phoneNumber: data.phoneNumber || null,
        tenantId: data.tenantId || null
      }
    };
  }
}

export const usersService = new UsersService()

// Update the createUser function
export async function createUser(data: Partial<User>): Promise<User> {
  return createUserWithDefaults(data);
}

// Update the updateUser function
export async function updateUser(uid: string, data: Partial<User>): Promise<User> {
  const now = Date.now();
  const updatedData = {
    ...data,
    updatedAt: now
  };
  return createUserWithDefaults({ ...updatedData, uid });
}

