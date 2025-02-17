import { User as FirebaseUser } from 'firebase/auth';
import { AppUser as AppUserType, UserRole, UserStatus } from '@/app/types/user';

// Define a constant for admin emails that can be easily updated
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'dev.yosefali@gmail.com'
].filter(Boolean) as string[];

// Role hierarchy definition - each role includes permissions of roles that come after it
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER],
  [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER],
  [UserRole.AUTHOR]: [UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER],
  [UserRole.EDITOR]: [UserRole.EDITOR, UserRole.USER],
  [UserRole.USER]: [UserRole.USER],
  [UserRole.GUEST]: [UserRole.GUEST]
};

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

  public hasRole(user: AppUserType | null, requiredRole: UserRole): boolean {
    if (!user?.role) return false;
    return ROLE_HIERARCHY[user.role]?.includes(requiredRole) || false;
  }

  public isAdmin(user: AppUserType | null): boolean {
    if (!user) return false;
    return this.hasRole(user, UserRole.ADMIN) || this.hasRole(user, UserRole.SUPER_ADMIN);
  }

  public isAuthor(user: AppUserType | null): boolean {
    if (!user) return false;
    return this.hasRole(user, UserRole.AUTHOR);
  }

  public canManageUsers(user: AppUserType | null): boolean {
    return this.isAdmin(user);
  }

  public canEditContent(user: AppUserType | null): boolean {
    if (!user) return false;
    return this.hasRole(user, UserRole.EDITOR);
  }

  public canCreateContent(user: AppUserType | null): boolean {
    if (!user) return false;
    return this.hasRole(user, UserRole.AUTHOR);
  }

  public isActiveUser(user: AppUserType | null): boolean {
    return user?.status === UserStatus.ACTIVE;
  }

  // Create authorization context with full user information
  static createContext(user: FirebaseUser | null, resourceOwnerId?: string): AuthorizationContext {
    if (!user) {
      return { user: null, resourceOwnerId };
    }

    const now = Date.now();
    // Determine role based on email for admin or default to USER
    const role = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
      ? UserRole.ADMIN
      : UserRole.USER;

    return {
      user: {
        ...user,
        email: user.email || '', // Convert null to empty string
        displayName: user.displayName || '', // Convert null to empty string
        role,
        status: UserStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
        metadata: {
          lastLogin: user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : now,
          createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : now,
          role,
          status: UserStatus.ACTIVE,
          displayName: user.displayName || '', // Convert null to empty string
          email: user.email || '', // Convert null to empty string
          photoURL: user.photoURL,
          uid: user.uid,
          emailVerified: user.emailVerified
        },
        invitedBy: null,
        invitationToken: null,
        id: user.uid
      },
      resourceOwnerId
    };
  }

  // Determine if a user has permission to access a resource
  // @param context Authorization context
  // @param requiredRole Minimum role required
  // @returns Boolean indicating access permission
  static canAccess(userOrContext: AuthorizationContext | AppUserType, requiredRole: UserRole = UserRole.USER): boolean {
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
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Author can access their own resources and create new ones
    if (user.role === UserRole.AUTHOR) {
      if (requiredRole === UserRole.USER || requiredRole === UserRole.AUTHOR) {
        return resourceOwnerId ? user.uid === resourceOwnerId : true;
      }
      return false;
    }

    // Regular user has minimal access
    return requiredRole === UserRole.USER;
  }

  // Check if the user is an admin
  // @param user User object
  // @returns Boolean indicating admin status
  static isAdmin(user: AppUserType | null): boolean {
    if (!user) return false;
    return user.role === UserRole.ADMIN;
  }

  // Add an admin email to the list of admin emails

  // Remove an admin email from the list of admin emails

  // Get the current list of admin emails

  // Check if a user can create a post
  // @param user User object
  // @returns Boolean indicating permission
  static canCreatePost(user: FirebaseUser | null): boolean {
    const someValue = this.canAccess(this.createContext(user), UserRole.AUTHOR);
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
    return this.canAccess(context, UserRole.ADMIN) || false;
  }

  // Check if a user can manage users
  // @param user User object
  // @returns Boolean indicating permission
  static canManageUsers(user: FirebaseUser | null): boolean {
    return this.canAccess(this.createContext(user), UserRole.ADMIN);
  }

  // Check if a user can invite authors
  // @param user User object
  // @returns Boolean indicating permission
  static canInviteAuthors(user: FirebaseUser | null): boolean {
    return this.canAccess(this.createContext(user), UserRole.ADMIN);
  }
}

// Export singleton instance
export const authorization = Authorization.getInstance();

// Utility function to handle unauthorized access
export function assertAuthorized(
  context: AuthorizationContext,
  requiredRole: UserRole = UserRole.USER
): void {
  const auth = Authorization.getInstance();

  if (!context.user || !auth.hasRole(context.user, requiredRole)) {
    throw new Error('Unauthorized access');
  }

  if (!auth.isActiveUser(context.user)) {
    throw new Error('Account is not active');
  }
}
