import { db } from "@/lib/firebase";
import { User, UserRole, UserStatus, AppUserUpdateData } from "../types/user";
import { emailService } from "./email";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  where,
  updateDoc,
  writeBatch,
  runTransaction,
  DocumentReference,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import {
  User as FirebaseUser,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";

const USERS_COLLECTION = "users";

class UsersService {
  private readonly usersRef = collection(db, USERS_COLLECTION);

  private async convertTimestamp(timestamp: unknown): Promise<number> {
    return timestamp instanceof Timestamp ? timestamp.toMillis() : Date.now();
  }

  private createUserObject(
    uid: string,
    data: Partial<User> & { metadata?: any }
  ): Omit<User, keyof FirebaseUser> {
    const now = Date.now();

    // Convert Timestamp objects to milliseconds
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toMillis()
        : data.createdAt ?? now;
    const updatedAt =
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toMillis()
        : data.updatedAt ?? now;
    const lastLogin =
      data.metadata?.lastLogin instanceof Timestamp
        ? data.metadata.lastLogin.toMillis()
        : data.metadata?.lastLogin ?? now;
    const metadataCreatedAt =
      data.metadata?.createdAt instanceof Timestamp
        ? data.metadata.createdAt.toMillis()
        : data.metadata?.createdAt ?? createdAt;

    // Return only serializable properties
    return {
      uid,
      email: data.email ?? null,
      role: data.role ?? UserRole.USER,
      displayName: data.displayName ?? null,
      photoURL: data.photoURL ?? null,
      createdAt,
      updatedAt,
      status: data.status ?? UserStatus.ACTIVE,
      invitedBy: data.invitedBy ?? null,
      invitationToken: data.invitationToken ?? null,
      emailVerified: false,
      metadata: {
        createdAt: metadataCreatedAt,
        lastLogin,
      }
    };
  }

  private getUserRef(uid: string): DocumentReference {
    return doc(this.usersRef, uid);
  }

  private async setCustomClaims(
    uid: string,
    claims: { role: UserRole }
  ): Promise<void> {
    try {
      const auth = getAuth();
      // Get base URL from environment or default to localhost in development
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (
        process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000' 
          : typeof window !== 'undefined' 
            ? window.location.origin 
            : ''
      );
      
      if (!baseUrl) {
        throw new Error('Application URL is not configured');
      }

      const apiUrl = `${baseUrl}/api/auth/set-custom-claims`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, claims }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to set custom claims: ${errorData?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error setting custom claims:", error);
      throw error;
    }
  }

  async createUserIfNotExists(
    firebaseUser: FirebaseUser
  ): Promise<User | null> {
    try {
      const { uid, email, displayName, photoURL } = firebaseUser;

      const existingUser = await this.getUser(uid);
      if (existingUser) return existingUser;

      const role = UserRole.USER;
      const userData: Partial<User> = {
        email: email ?? "",
        displayName: displayName ?? undefined,
        photoURL: photoURL ?? undefined,
        role,
        status: UserStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await Promise.all([
        this.createOrUpdateUser(uid, userData),
        this.setCustomClaims(uid, { role }),
      ]);

      return this.createUserObject(uid, userData);
    } catch (error) {
      console.error("Error in createUserIfNotExists:", error);
      return null;
    }
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

  async getCurrentUser(): Promise<User | null> {
    try {
      // Get the current Firebase user
      const auth = getAuth();
      const firebaseUser = auth.currentUser;

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

  async updateUserRole(uid: string, role: UserRole): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      const userRef = doc(this.usersRef, uid);

      // First check if user exists
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        const error = `User with ID ${uid} not found in Firestore`;
        console.error(error);
        return {
          success: false,
          error: "User not found in the database",
          details: { 
            uid,
            error,
            currentRole: null
          }
        };
      }

      const userData = userDoc.data();
      const currentRole = userData?.role || 'none';

      // Update Firestore document
      try {
        await updateDoc(userRef, {
          role,
          updatedAt: Date.now(),
        });
      } catch (firestoreError: any) {
        const error = `Failed to update user role in Firestore: ${firestoreError.message}`;
        console.error(error);
        return {
          success: false,
          error: "Failed to update user role in database",
          details: {
            uid,
            currentRole,
            targetRole: role,
            errorMessage: firestoreError.message,
            errorCode: firestoreError.code,
            error
          }
        };
      }

      // Update Firebase Auth custom claims through API
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (
          process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3000' 
            : typeof window !== 'undefined' 
              ? window.location.origin 
              : ''
        );
        
        if (!baseUrl) {
          throw new Error('Application URL is not configured');
        }

        const apiUrl = `${baseUrl}/api/auth/set-custom-claims`;
        const authResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid, claims: { role } }),
        });

        if (!authResponse.ok) {
          const errorData = await authResponse.json();
          const error = `Failed to update user role in authentication. Status: ${authResponse.status}, Message: ${errorData?.error || 'Unknown error'}`;
          console.error(error, {
            status: authResponse.status,
            statusText: authResponse.statusText,
            errorData
          });
          return {
            success: false,
            error: "Failed to update user role in authentication system",
            details: {
              uid,
              currentRole,
              targetRole: role,
              status: authResponse.status,
              statusText: authResponse.statusText,
              errorData,
              error
            }
          };
        }
      } catch (fetchError: any) {
        const error = `Network error while updating user role: ${fetchError.message}`;
        console.error(error);
        return {
          success: false,
          error: "Failed to communicate with authentication system",
          details: {
            uid,
            currentRole,
            targetRole: role,
            errorMessage: fetchError.message,
            error
          }
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Unexpected error in updateUserRole:", {
        uid,
        role,
        error: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: "An unexpected error occurred while updating user role",
        details: {
          message: error.message,
          stack: error.stack
        }
      };
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

  async deleteUser(uid: string): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      // First check if user exists
      const userRef = doc(this.usersRef, uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error(`User with ID ${uid} not found in Firestore`);
        return {
          success: false,
          error: 'User not found in the database',
          details: { uid }
        };
      }

      // Delete from Firebase Auth first
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (
        process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000' 
          : typeof window !== 'undefined' 
            ? window.location.origin 
            : ''
      );
      
      if (!baseUrl) {
        throw new Error('Application URL is not configured');
      }

      const apiUrl = `${baseUrl}/api/users/delete`;
      const authResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        console.error('Failed to delete user from authentication:', {
          status: authResponse.status,
          statusText: authResponse.statusText,
          errorData
        });
        return {
          success: false,
          error: 'Failed to delete user from authentication system',
          details: {
            status: authResponse.status,
            statusText: authResponse.statusText,
            errorData
          }
        };
      }

      // If auth deletion succeeds, delete from Firestore
      try {
        await deleteDoc(userRef);
      } catch (firestoreError) {
        console.error('Failed to delete user from Firestore:', firestoreError);
        return {
          success: false,
          error: 'Failed to delete user data from the database',
          details: firestoreError
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error in deleteUser:', {
        uid,
        error: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: 'An unexpected error occurred while deleting the user',
        details: {
          message: error.message,
          stack: error.stack
        }
      };
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const snapshot = await getDocs(this.usersRef);
      return snapshot.docs.map((doc) =>
        this.createUserObject(doc.id, doc.data())
      );
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async setupInitialAdmin(email: string): Promise<boolean> {
    try {
      // Find user by email
      const usersQuery = query(this.usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        // User doesn't exist yet, create a new admin user
        const userData: Partial<User> = {
          email,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // Generate a new document reference with auto-generated ID
        const newUserRef = doc(this.usersRef);
        await setDoc(newUserRef, userData);
        return true;
      }

      // User exists, update to admin role
      const userDoc = querySnapshot.docs[0];
      await updateDoc(userDoc.ref, {
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        updatedAt: Date.now(),
      });

      return true;
    } catch (error) {
      console.error("Error setting up admin:", error);
      return false;
    }
  }

  async acceptAuthorInvitation(email: string, token: string): Promise<boolean> {
    try {
      // Find the user with matching email and invitation token
      const usersQuery = query(
        this.usersRef,
        where("email", "==", email),
        where("invitationToken", "==", token),
        where("status", "==", UserStatus.INVITED)
      );

      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        throw new Error("Invalid invitation or already accepted");
      }

      const userDoc = querySnapshot.docs[0];
      const userRef = this.getUserRef(userDoc.id);

      // Update user role and status
      await updateDoc(userRef, {
        role: UserRole.AUTHOR,
        status: UserStatus.ACTIVE,
        invitationToken: null,
        updatedAt: Date.now(),
      });

      return true;
    } catch (error) {
      console.error("Error accepting author invitation:", error);
      return false;
    }
  }

  async updateUserRoleBasedOnAdminEmails(): Promise<void> {
    try {
      const users = await this.getAllUsers(); // Fetch all users
      const adminEmails = [
        process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        "dev.yosefali@gmail.com",
        "yosefmdsc@gmail.com",
        "yaredd.degefu@gmail.com",
      ].filter(Boolean);

      for (const user of users) {
        if (user.email && adminEmails.includes(user.email)) {
          await this.updateUserRole(user.uid, UserRole.ADMIN); // Update role to ADMIN
        }
      }
    } catch (error) {
      console.error("Error updating user roles based on admin emails:", error);
      throw error;
    }
  }

  async resetUserPassword(email: string): Promise<void> {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }

  async inviteUser(
    adminEmail: string,
    targetEmail: string,
    role: UserRole
  ): Promise<{
    success: boolean;
    existingUser?: { email: string; role: string };
  }> {
    try {
      // Check if user already exists
      const usersQuery = query(
        this.usersRef,
        where("email", "==", targetEmail)
      );
      const querySnapshot = await getDocs(usersQuery);

      if (!querySnapshot.empty) {
        const existingUserDoc = querySnapshot.docs[0];
        const existingUserData = existingUserDoc.data();
        return {
          success: false,
          existingUser: {
            email: existingUserData.email,
            role: existingUserData.role,
          },
        };
      }

      // Generate invitation token
      const invitationToken = Math.random().toString(36).substring(2, 15);

      // Create new user document
      const newUserData: Partial<User> = {
        email: targetEmail,
        role: role as UserRole,
        status: UserStatus.INVITED,
        invitedBy: adminEmail,
        invitationToken,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Create user document with auto-generated ID
      const newUserRef = doc(this.usersRef);
      await setDoc(newUserRef, newUserData);

      // Send invitation email
      const emailSent = await emailService.sendInvitationEmail(
        targetEmail,
        role
      );
      if (!emailSent) {
        // If email fails to send, delete the user document
        await deleteDoc(newUserRef);
        throw new Error("Failed to send invitation email");
      }

      return { success: true };
    } catch (error) {
      console.error("Error inviting user:", error);
      throw error;
    }
  }
}

export const usersService = new UsersService();
