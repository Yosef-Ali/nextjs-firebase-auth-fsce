import { User, UserRole, UserStatus } from "../../types/user";
import { User as FirebaseUser } from "firebase/auth";
import { userCoreService } from "./core";
import { userAuthService } from "./auth";
import { userInvitationService } from "./invitation";

class UsersService {
  // Core user operations
  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      const { uid, email, displayName, photoURL } = firebaseUser;

      const existingUser = await userCoreService.getUser(uid);
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

      await userCoreService.createOrUpdateUser(uid, userData);
      await userAuthService.updateUserRole(uid, role);

      return userCoreService.getUser(uid);
    } catch (error) {
      console.error("Error in createUserIfNotExists:", error);
      return null;
    }
  }

  // Delegate methods to appropriate services
  getUser = userCoreService.getUser.bind(userCoreService);
  getCurrentUser = userCoreService.getCurrentUser.bind(userCoreService);
  createOrUpdateUser = userCoreService.createOrUpdateUser.bind(userCoreService);
  updateUserStatus = userCoreService.updateUserStatus.bind(userCoreService);
  getAllUsers = userCoreService.getAllUsers.bind(userCoreService);

  updateUserRole = userAuthService.updateUserRole.bind(userAuthService);
  resetUserPassword = userAuthService.resetUserPassword.bind(userAuthService);

  setupInitialAdmin = userInvitationService.setupInitialAdmin.bind(userInvitationService);
  acceptAuthorInvitation = userInvitationService.acceptAuthorInvitation.bind(userInvitationService);
  updateUserRoleBasedOnAdminEmails = userInvitationService.updateUserRoleBasedOnAdminEmails.bind(userInvitationService);
  inviteUser = userInvitationService.inviteUser.bind(userInvitationService);
}

export const usersService = new UsersService();