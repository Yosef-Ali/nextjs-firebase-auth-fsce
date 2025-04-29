import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '@/lib/firebase'; // Import Firestore instance

export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  EDITOR = 'editor',
  USER = 'user',
  GUEST = 'guest'
}

export interface AuthorizationContext {
  user: User | null;
  resourceOwnerId?: string;
}

export class Authorization {
  private static instance: Authorization;

  private constructor() { }

  static getInstance(): Authorization {
    if (!Authorization.instance) {
      Authorization.instance = new Authorization();
    }
    return Authorization.instance;
  }

  // Cache for user roles to minimize Firestore reads per request/session
  private userRoleCache: Map<string, UserRole> = new Map();

  // Function to clear the cache (e.g., on logout or role change)
  clearRoleCache(userId?: string): void {
    if (userId) {
      this.userRoleCache.delete(userId);
    } else {
      this.userRoleCache.clear();
    }
  }

  async getUserRole(user: User | null): Promise<UserRole> {
    if (!user) {
      return UserRole.GUEST;
    }
    if (this.userRoleCache.has(user.uid)) {
      const cachedRole = this.userRoleCache.get(user.uid)!;
      return cachedRole;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData?.role && typeof userData.role === 'string') {
          const roleStringUpper = userData.role.toUpperCase(); // Convert fetched role to uppercase

          // Compare the UPPERCASE Firestore string with the UPPERCASE ENUM KEY
          if (roleStringUpper === UserRole.ADMIN.toUpperCase()) {
            this.userRoleCache.set(user.uid, UserRole.ADMIN);
            return UserRole.ADMIN;
          } else if (roleStringUpper === UserRole.AUTHOR.toUpperCase()) {
            this.userRoleCache.set(user.uid, UserRole.AUTHOR);
            return UserRole.AUTHOR;
          } else if (roleStringUpper === UserRole.EDITOR.toUpperCase()) {
            this.userRoleCache.set(user.uid, UserRole.EDITOR);
            return UserRole.EDITOR;
          } else if (roleStringUpper === UserRole.USER.toUpperCase()) {
            this.userRoleCache.set(user.uid, UserRole.USER);
            return UserRole.USER;
          }
        }
      }
    } catch (error) {
      console.error(`[Auth] Error fetching user role for ${user.uid}:`, error);
    }

    // Default role
    const defaultRole = UserRole.USER;
    this.userRoleCache.set(user.uid, defaultRole);
    return defaultRole;
  }

  // isAdmin now relies on getUserRole
  async isAdmin(user: User | null): Promise<boolean> {
    if (!user) return false;
    const role = await this.getUserRole(user);
    return role === UserRole.ADMIN;
  }

  async canAccess(context: AuthorizationContext, requiredRole: UserRole = UserRole.USER): Promise<boolean> {
    if (!context.user && requiredRole !== UserRole.GUEST) {
      return false;
    }

    const userRole = await this.getUserRole(context.user);

    // Admin has access to everything
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Define role hierarchy (Lower roles can access resources requiring higher roles)
    // Example: If requiredRole is EDITOR, users with EDITOR, AUTHOR, or ADMIN roles should have access.
    // Let's redefine this based on typical access patterns: Higher roles include lower roles' permissions.
    const rolePermissions: Record<UserRole, number> = {
      [UserRole.GUEST]: 0,
      [UserRole.USER]: 1,
      [UserRole.EDITOR]: 2,
      [UserRole.AUTHOR]: 3, // Authors might have specific content creation permissions
      [UserRole.ADMIN]: 4
    };

    // Check if the user's permission level is greater than or equal to the required level
    return rolePermissions[userRole] >= rolePermissions[requiredRole];
  }

  createContext(user: User | null, resourceOwnerId?: string): AuthorizationContext {
    return { user, resourceOwnerId };
  }

  async canCreatePost(user: User | null): Promise<boolean> {
    // Typically Authors and Admins can create posts
    const userRole = await this.getUserRole(user);
    return userRole === UserRole.AUTHOR || userRole === UserRole.ADMIN || userRole === UserRole.EDITOR; // Allow Editors too? Adjust as needed.
  }

  async canEditPost(user: User | null, postAuthorId?: string): Promise<boolean> {
    if (!user) return false;
    const userRole = await this.getUserRole(user);

    // Admins and Editors can edit any post
    if (userRole === UserRole.ADMIN || userRole === UserRole.EDITOR) {
      return true;
    }

    // Authors can edit their own posts
    if (userRole === UserRole.AUTHOR && postAuthorId && user.uid === postAuthorId) {
      return true;
    }

    return false;
  }

  async canDeletePost(user: User | null, postAuthorId?: string): Promise<boolean> {
    if (!user) return false; // Must be logged in

    const userRole = await this.getUserRole(user);

    // Admins and Editors can delete any post
    if (userRole === UserRole.ADMIN || userRole === UserRole.EDITOR) {
      return true;
    }

    // Authors can delete their own posts
    if (userRole === UserRole.AUTHOR && postAuthorId && user.uid === postAuthorId) {
      return true;
    }

    // Otherwise, no permission
    return false;
  }

  async canManageUsers(user: User | null): Promise<boolean> {
    // Only Admins can manage users
    return this.isAdmin(user);
  }

  async canInviteAuthors(user: User | null): Promise<boolean> {
    // Only Admins can invite authors
    return this.isAdmin(user);
  }
}

// Export a singleton instance
export const authorization = Authorization.getInstance();

// Utility function to handle unauthorized access (needs to be async)
export async function assertAuthorized(context: AuthorizationContext, requiredRole: UserRole = UserRole.USER): Promise<void> {
  const auth = Authorization.getInstance();
  // Re-evaluate canAccess logic if needed based on the rolePermissions definition
  const userRole = await auth.getUserRole(context.user);
  const rolePermissions: Record<UserRole, number> = {
    [UserRole.GUEST]: 0,
    [UserRole.USER]: 1,
    [UserRole.EDITOR]: 2,
    [UserRole.AUTHOR]: 3,
    [UserRole.ADMIN]: 4
  };

  if (rolePermissions[userRole] < rolePermissions[requiredRole]) {
    throw new Error('Unauthorized'); // Or a more specific error
  }
}
