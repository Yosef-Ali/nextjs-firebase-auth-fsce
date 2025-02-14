import { User as FirebaseUser } from 'firebase/auth';
import { AppUser as AppUserType, UserRole as AppUserRole, UserStatus } from '@/app/types/user';

// Role hierarchy definition - each role includes permissions of roles that come after it
const ROLE_HIERARCHY = {
  [AppUserRole.SUPER_ADMIN]: [AppUserRole.SUPER_ADMIN, AppUserRole.ADMIN, AppUserRole.AUTHOR, AppUserRole.EDITOR, AppUserRole.USER],
  [AppUserRole.ADMIN]: [AppUserRole.ADMIN, AppUserRole.AUTHOR, AppUserRole.EDITOR, AppUserRole.USER],
  [AppUserRole.AUTHOR]: [AppUserRole.AUTHOR, AppUserRole.EDITOR, AppUserRole.USER],
  [AppUserRole.EDITOR]: [AppUserRole.EDITOR, AppUserRole.USER],
  [AppUserRole.USER]: [AppUserRole.USER],
  [AppUserRole.GUEST]: [AppUserRole.GUEST]
};

// Define a constant for admin emails that can be easily updated
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'dev.yosefali@gmail.com'
].filter(Boolean) as string[];

interface AuthorizationContext {
  user: AppUserType | null;
  resourceOwnerId?: string;
}

export class Authorization {
  private static instance: Authorization;

  private constructor() { }

  public static getInstance(): Authorization {
    if (!Authorization.instance) {
      Authorization.instance = new Authorization();
    }
    return Authorization.instance;
  }

  public hasRole(user: AppUserType | null, requiredRole: AppUserRole): boolean {
    if (!user?.role) return false;
    return ROLE_HIERARCHY[user.role]?.includes(requiredRole) || false;
  }

  public isAdmin(user: AppUserType | null): boolean {
    if (!user) return false;
    return this.hasRole(user, AppUserRole.ADMIN) || this.hasRole(user, AppUserRole.SUPER_ADMIN);
  }

  public isAuthor(user: AppUserType | null): boolean {
    if (!user) return false;
    return this.hasRole(user, AppUserRole.AUTHOR);
  }

  public canManageUsers(user: AppUserType | null): boolean {
    return this.isAdmin(user);
  }

  public canEditContent(user: AppUserType | null): boolean {
    if (!user) return false;
    return this.hasRole(user, AppUserRole.EDITOR);
  }

  public canCreateContent(user: AppUserType | null): boolean {
    if (!user) return false;
    return this.hasRole(user, AppUserRole.AUTHOR);
  }

  public isActiveUser(user: AppUserType | null): boolean {
    return user?.status === UserStatus.ACTIVE;
  }

  // Create authorization context with full user information
  static createContext(user: FirebaseUser | null, resourceOwnerId?: string): AuthorizationContext {
    if (!user) {
      return { user: null, resourceOwnerId };
    }

    // Determine role based on email for admin or default to USER
    const role = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
      ? AppUserRole.ADMIN
      : AppUserRole.USER;

    return {
      user: {
        ...user,
        role,
        status: UserStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
          lastLogin: user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : Date.now(),
          createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now()
        }
      } as AppUserType,
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

// Export singleton instance
export const authorization = Authorization.getInstance();

// Utility function to handle unauthorized access
export function assertAuthorized(
  context: AuthorizationContext,
  requiredRole: AppUserRole = AppUserRole.USER
): void {
  const auth = Authorization.getInstance();

  if (!context.user || !auth.hasRole(context.user, requiredRole)) {
    throw new Error('Unauthorized access');
  }

  if (!auth.isActiveUser(context.user)) {
    throw new Error('Account is not active');
  }
}
