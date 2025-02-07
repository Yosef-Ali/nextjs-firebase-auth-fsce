import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, UserRole, UserStatus } from "../../types/user";
import { emailService } from "../email";
import { userCoreService } from "./core";

const USERS_COLLECTION = "users";

class UserInvitationService {
  private readonly usersRef = collection(db, USERS_COLLECTION);

  async setupInitialAdmin(email: string): Promise<boolean> {
    try {
      // Find user by email
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
      await setDoc(userDoc.ref, {
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
        where("status", "==", UserStatus.INVITED)
      );

      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        throw new Error("Invalid invitation or already accepted");
      }

      const userDoc = querySnapshot.docs[0];

      // Update user role and status
      await setDoc(userDoc.ref, {
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
        "yosefmdsc@gmail.com",
        "yaredd.degefu@gmail.com",
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

  async inviteUser(email: string, role: UserRole): Promise<boolean> {
    try {
      // Generate invitation token
      const token = Math.random().toString(36).substring(2, 15);

      // Create user document with invitation status
      const userData: Partial<User> = {
        email,
        role,
        status: UserStatus.INVITED,
        invitationToken: token,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newUserRef = doc(this.usersRef);
      await setDoc(newUserRef, userData);

      // Send invitation email
      await emailService.sendInvitationEmail(email);

      return true;
    } catch (error) {
      console.error("Error inviting user:", error);
      return false;
    }
  }
}

export const userInvitationService = new UserInvitationService();