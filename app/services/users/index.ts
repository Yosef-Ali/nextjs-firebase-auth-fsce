import { User as FirebaseUser } from 'firebase/auth';
import { User, UserRole, UserStatus } from '@/app/types/user';
import { userCoreService } from './core';
import { userAuthService } from './auth';
import { userInvitationService } from './invitation';
import { useState, useCallback, useEffect } from 'react';
import { onSnapshot, collection, doc, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Response types
export interface CreateUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface InviteUserResponse {
  success: boolean;
  existingUser?: {
    email: string;
    role: UserRole;
  };
}

// Custom hook for real-time user data
export function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot: DocumentSnapshot) => {
        if (docSnapshot.exists()) {
          setUser({ id: docSnapshot.id, ...docSnapshot.data() } as User);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { user, loading, error };
}

// Custom hook for real-time users list
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        setUsers(usersList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { users, loading, error };
}

// User management functions with React hooks integration
export const usersService = {
  // Create or get existing user
  createUserIfNotExists: async (firebaseUser: FirebaseUser): Promise<CreateUserResponse> => {
    if (!firebaseUser?.uid) {
      return { success: false, error: "No user ID provided" };
    }

    try {
      const existingUser = await userCoreService.getUser(firebaseUser.uid);
      if (existingUser) {
        return { success: true, user: existingUser };
      }

      const now = new Date().toISOString();
      const userData: Partial<User> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? "",
        displayName: firebaseUser.displayName ?? firebaseUser.email ?? "Unnamed User",
        photoURL: firebaseUser.photoURL ?? null,
        emailVerified: firebaseUser.emailVerified,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
        isAnonymous: false,
        id: firebaseUser.uid,
        metadata: {
          lastLogin: now,
          createdAt: now,
          role: UserRole.USER,
          status: UserStatus.ACTIVE
        }
      };

      await userCoreService.createOrUpdateUser(firebaseUser.uid, userData);
      const newUser = await userCoreService.getUser(firebaseUser.uid);

      if (!newUser) {
        return { success: false, error: "Failed to create user document" };
      }

      return { success: true, user: newUser };
    } catch (error) {
      console.error("Error in createUserIfNotExists:", error);
      return { success: false, error: String(error) };
    }
  },

  // Invite new user with proper error handling
  inviteUser: async (adminEmail: string, targetEmail: string, role: UserRole): Promise<InviteUserResponse> => {
    try {
      const result = await userInvitationService.inviteUser(adminEmail, targetEmail, role);
      if (result.success) {
        return { success: true };
      }
      if (result.existingUser) {
        return {
          success: false,
          existingUser: {
            email: result.existingUser.email,
            role: result.existingUser.role as UserRole
          }
        };
      }
      return { success: false };
    } catch (error) {
      console.error("Error inviting user:", error);
      throw error;
    }
  },

  // Core service functions
  getUser: userCoreService.getUser,
  getCurrentUser: userCoreService.getCurrentUser,
  createOrUpdateUser: userCoreService.createOrUpdateUser,
  updateUserStatus: userCoreService.updateUserStatus,
  getAllUsers: userCoreService.getAllUsers,
  deleteUser: userCoreService.deleteUser,

  // Auth service functions
  updateUserRole: userAuthService.updateUserRole,
  resetUserPassword: userAuthService.resetUserPassword,

  // Invitation service functions
  setupInitialAdmin: userInvitationService.setupInitialAdmin,
  acceptAuthorInvitation: userInvitationService.acceptAuthorInvitation,
  updateUserRoleBasedOnAdminEmails: userInvitationService.updateUserRoleBasedOnAdminEmails
};
