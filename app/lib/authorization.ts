import { User as FirebaseUser } from 'firebase/auth';
import { AppUser as AppUserType, UserRole as AppUserRole, UserStatus } from '@/app/types/user';  // Import AppUser

interface AuthorizationContext {
  user: AppUserType | null;
  resourceOwnerId?: string;
}

export class Authorization {
  private static instance: Authorization;

  constructor() {}

  public static getInstance(): Authorization {
    if (!Authorization.instance) {
      Authorization.instance = new Authorization();
    }
    return Authorization.instance;
  }

  public isAdmin(user: AppUserType | null): boolean {
    if (!user) return false;
    return user.role === AppUserRole.ADMIN;
  }

  public isAuthor(user: AppUserType | null): boolean {
    if (!user) return false;
    return user.role === AppUserRole.AUTHOR || user.role === AppUserRole.ADMIN;
  }

  // Get user role from user document
  // @param user User object
  // @returns UserRole
  static getUserRole(user: FirebaseUser | null): AppUserRole {
    if (!user) return AppUserRole.USER;
    return user.role || AppUserRole.USER;
  }

  // Create authorization context
  // @param user User object
  // @param resourceOwnerId Optional resource owner ID
  // @returns AuthorizationContext
  static createContext(user: FirebaseUser | null, resourceOwnerId?: string): AuthorizationContext {
    return {
      user: user ? {
        ...user,
        role: this.getUserRole(user),
        status: UserStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        invitedBy: null,
        invitationToken: null,
      } as AppUserType : null,
      resourceOwnerId
    };
  }

  // Determine if a user has permission to access a resource
  // @param context Authorization context
  // @param requiredRole Minimum role required
  // @returns Boolean indicating access permission
  static canAccess(userOrContext: AuthorizationContext | AppUserType, requiredRole: AppUserRole = AppUserRole.USER): boolean {
    let user: AppUserType | null = null;
    let resourceOwnerId: string | undefined = undefined;

    if ((userOrContext as AuthorizationContext).user) {
      const context = userOrContext as AuthorizationContext;
      user = context.user;
      resourceOwnerId = context.resourceOwnerId;
    } else {
      user = userOrContext as AppUserType;
    }

    if (!user) return false;

    // Admin has full access
    if (user.role === AppUserRole.ADMIN) {
      return true;
    }

    // Author can access their own resources and create new ones
    if (user.role === AppUserRole.AUTHOR) {
      if (requiredRole === AppUserRole.USER || requiredRole === AppUserRole.AUTHOR) {
        return resourceOwnerId ? user.uid === resourceOwnerId : true;
      }
      return false;
    }

    // Regular user has minimal access
    return requiredRole === AppUserRole.USER;
  }

  // Check if the user is an admin
  // @param user User object
  // @returns Boolean indicating admin status
  static isAdmin(user: AppUserType | null): boolean {
    if (!user) return false;
    return user.role === AppUserRole.ADMIN;
  }

  // Add an admin email to the list of admin emails

  // Remove an admin email from the list of admin emails

  // Get the current list of admin emails

  // Check if a user can create a post
  // @param user User object
  // @returns Boolean indicating permission
  static canCreatePost(user: FirebaseUser | null): boolean {
    const someValue = this.canAccess(this.createContext(user), AppUserRole.AUTHOR);
    return someValue !== null && someValue !== undefined ? someValue : false;
  }

  // Check if a user can delete a post
  // @param user User object
  // @param postAuthorId Post author ID
  // @returns Boolean indicating permission
  static canDeletePost(user: FirebaseUser | null, postAuthorId?: string): boolean {
    const context = this.createContext(user, postAuthorId);
    // Ensure context is valid before proceeding
    if (!context || !context.user) return false;
    return this.canAccess(context, AppUserRole.ADMIN) || false;
  }

  // Check if a user can manage users
  // @param user User object
  // @returns Boolean indicating permission
  static canManageUsers(user: FirebaseUser | null): boolean {
    return this.canAccess(this.createContext(user), AppUserRole.ADMIN);
  }

  // Check if a user can invite authors
  // @param user User object
  // @returns Boolean indicating permission
  static canInviteAuthors(user: FirebaseUser | null): boolean {
    return this.canAccess(this.createContext(user), AppUserRole.ADMIN);
  }
}

// Utility function to handle unauthorized access
// @param context Authorization context
// @param requiredRole Minimum role required
// @throws Error if access is not permitted
export function assertAuthorized(
  context: AuthorizationContext,
  requiredRole: AppUserRole = AppUserRole.USER
): void {
  if (!Authorization.canAccess(context, requiredRole)) {
    throw new Error('Unauthorized access');
  }
}
