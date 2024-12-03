import { User } from 'firebase/auth';

// Define a constant for admin emails that can be easily updated
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL, 
  'dev.yosefali@gmail.com', 
  'yosefmdsc@gmail.com'
].filter(Boolean) as string[];

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
  /**
   * Determine if a user has permission to access a resource
   * @param context Authorization context
   * @param requiredRole Minimum role required
   * @returns Boolean indicating access permission
   */
  static canAccess(context: AuthorizationContext, requiredRole: UserRole = UserRole.USER): boolean {
    // No user means no access
    if (!context.user) return false;

    // Admin always has full access
    if (this.isAdmin(context.user)) return true;

    // For user-specific resources, check ownership
    if (context.resourceOwnerId) {
      return context.user.uid === context.resourceOwnerId;
    }

    // Default to user role
    return requiredRole === UserRole.USER;
  }

  /**
   * Check if the user is an admin
   * @param user User object
   * @returns Boolean indicating admin status
   */
  static isAdmin(user: User | null): boolean {
    return user?.email ? ADMIN_EMAILS.includes(user.email) : false;
  }

  /**
   * Get user role
   * @param user User object
   * @returns UserRole
   */
  static getUserRole(user: User | null): UserRole {
    if (!user) return UserRole.GUEST;
    return this.isAdmin(user) ? UserRole.ADMIN : UserRole.USER;
  }

  /**
   * Add an admin email to the list of admin emails
   * @param email Email to add as an admin
   */
  static addAdminEmail(email: string): void {
    if (email && !ADMIN_EMAILS.includes(email)) {
      ADMIN_EMAILS.push(email);
    }
  }

  /**
   * Remove an admin email from the list of admin emails
   * @param email Email to remove from admin list
   */
  static removeAdminEmail(email: string): void {
    const index = ADMIN_EMAILS.indexOf(email);
    if (index > -1) {
      ADMIN_EMAILS.splice(index, 1);
    }
  }

  /**
   * Get the current list of admin emails
   * @returns Array of admin emails
   */
  static getAdminEmails(): string[] {
    return [...ADMIN_EMAILS];
  }

  /**
   * Create an authorization context
   * @param user User object
   * @param resourceOwnerId Optional resource owner ID
   * @returns AuthorizationContext
   */
  static createContext(user: User | null, resourceOwnerId?: string): AuthorizationContext {
    return { user, resourceOwnerId };
  }

  /**
   * Check if a user can create a post
   * @param user User object
   * @returns Boolean indicating permission
   */
  static canCreatePost(user: User | null): boolean {
    if (!user) return false;
    const role = this.getUserRole(user);
    return role === UserRole.ADMIN || role === UserRole.AUTHOR;
  }

  /**
   * Check if a user can edit a post
   * @param user User object
   * @param postAuthorId Post author ID
   * @returns Boolean indicating permission
   */
  static canEditPost(user: User | null, postAuthorId?: string): boolean {
    if (!user) return false;
    const role = this.getUserRole(user);
    if (role === UserRole.ADMIN) return true;
    if (role === UserRole.AUTHOR) {
      return postAuthorId === user.uid;
    }
    return false;
  }

  /**
   * Check if a user can delete a post
   * @param user User object
   * @param postAuthorId Post author ID
   * @returns Boolean indicating permission
   */
  static canDeletePost(user: User | null, postAuthorId?: string): boolean {
    if (!user) return false;
    const role = this.getUserRole(user);
    if (role === UserRole.ADMIN) return true;
    if (role === UserRole.AUTHOR) {
      return postAuthorId === user.uid;
    }
    return false;
  }

  /**
   * Check if a user can manage users
   * @param user User object
   * @returns Boolean indicating permission
   */
  static canManageUsers(user: User | null): boolean {
    return this.isAdmin(user);
  }

  /**
   * Check if a user can invite authors
   * @param user User object
   * @returns Boolean indicating permission
   */
  static canInviteAuthors(user: User | null): boolean {
    return this.isAdmin(user);
  }

  /**
   * Utility function to handle unauthorized access
   * @param context Authorization context
   * @param requiredRole Minimum role required
   * @throws Error if access is not permitted
   */
  static assertAuthorized(context: AuthorizationContext, requiredRole: UserRole = UserRole.USER): void {
    if (!this.canAccess(context, requiredRole)) {
      throw new Error('Unauthorized access');
    }
  }
}

/**
 * Utility function to handle unauthorized access
 * @param context Authorization context
 * @param requiredRole Minimum role required
 * @throws Error if access is not permitted
 */
export function assertAuthorized(context: AuthorizationContext, requiredRole: UserRole = UserRole.USER) {
  if (!Authorization.canAccess(context, requiredRole)) {
    throw new Error('Unauthorized: You do not have permission to perform this action.');
  }
}
