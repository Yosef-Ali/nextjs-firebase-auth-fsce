import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, UserRole, UserStatus } from "../../types/user";
import { emailService } from "../email";
import { userCoreService } from "./core";

const USERS_COLLECTION = "users";

class UserInvitationService {
  private readonly usersRef = collection(db, USERS_COLLECTION);

  async setupInitialAdmin(email: string): Promise<boolean> {
    try {
      // First check if user already exists
      const usersQuery = query(
        this.usersRef,
        where("email", "==", email)
      );
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
      await setDoc(doc(this.usersRef, userDoc.id), {
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        updatedAt: Date.now(),
      }, { merge: true });

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
        where("status", "==", "INVITED")
      );

      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        throw new Error("Invalid invitation or already accepted");
      }

      const userDoc = querySnapshot.docs[0];

      // Update user role and status
      await setDoc(doc(this.usersRef, userDoc.id), {
        role: UserRole.AUTHOR,
        status: UserStatus.ACTIVE,
        invitationToken: null,
        updatedAt: Date.now(),
      }, { merge: true });

      return true;
    } catch (error) {
      console.error("Error accepting author invitation:", error);
      return false;
    }
  }

  async updateUserRoleBasedOnAdminEmails(): Promise<void> {
    try {
      const users = await userCoreService.getAllUsers();
      const adminEmails = [
        process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        "dev.yosefali@gmail.com",
        "yaredd.degefu@gmail.com",
        "mekdesyared@gmail.com"
      ].filter(Boolean);

      for (const user of users) {
        if (user.email && adminEmails.includes(user.email)) {
          await userCoreService.updateUserRole(user.uid, UserRole.ADMIN);
        }
      }
    } catch (error) {
      console.error("Error updating user roles based on admin emails:", error);
      throw error;
    }
  }

  async inviteUser(
    adminEmail: string,
    targetEmail: string,
    role: UserRole
  ): Promise<{ success: boolean; existingUser?: { email: string; role: string } }> {
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
        role,
        status: "INVITED" as UserStatus,
        invitedBy: adminEmail,
        invitationToken,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Generate a new document reference with auto-generated ID
      const newUserRef = doc(this.usersRef);
      await setDoc(newUserRef, newUserData);

      // Send invitation email
      const emailSent = await emailService.sendInvitationEmail(targetEmail);
      if (!emailSent) {
        // If email fails to send, delete the user document
        await userCoreService.createOrUpdateUser(newUserRef.id, {
          status: UserStatus.PENDING,
        });
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error("Error inviting user:", error);
      throw error;
    }
  }
}

export const userInvitationService = new UserInvitationService();