import { User } from 'firebase/auth';
import { UserRole } from '../types/user';

// Define a constant for admin emails that can be easily updated
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL, 
  'dev.yosefali@gmail.com', 
  'yosefmdsc@gmail.com'
].filter(Boolean) as string[];

interface AuthorizationContext {
  user: User | null;
  resourceOwnerId?: string;
}

export class Authorization {
  private adminEmails: Set<string>;

  constructor() {
    this.adminEmails = new Set(ADMIN_EMAILS);
  }

  // Determine if a user has permission to access a resource
  // @param context Authorization context
  // @param requiredRole Minimum role required
  // @returns Boolean indicating access permission
  static canAccess(context: AuthorizationContext, requiredRole: UserRole = UserRole.USER): boolean {
    const { user } = context;

    // No user means no access
    if (!user) return false;

    // Get the user's role
    const userRole = this.getUserRole(user);

    // Admin always has access
    if (userRole === UserRole.ADMIN) return true;

    // Check if user has required role
    switch (requiredRole) {
      case UserRole.ADMIN:
        return userRole === UserRole.ADMIN;
      case UserRole.AUTHOR:
        return userRole === UserRole.AUTHOR;
      case UserRole.USER:
        return userRole === UserRole.USER;
      default:
        return true; // Guest access
    }
  }

  // Check if the user is an admin
  // @param user User object
  // @returns Boolean indicating admin status
  static isAdmin(user: User | null): boolean {
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.includes(user.email);
  }

  // Get user role
  // @param user User object
  // @returns UserRole
  static getUserRole(user: User | null): UserRole {
    if (!user) return UserRole.GUEST;
    if (this.isAdmin(user)) return UserRole.ADMIN;
    return UserRole.USER; // Default role for authenticated users
  }

  // Add an admin email to the list of admin emails
  // @param email Email to add as an admin
  static addAdminEmail(email: string): void {
    if (!ADMIN_EMAILS.includes(email)) {
      ADMIN_EMAILS.push(email);
    }
  }

  // Remove an admin email from the list of admin emails
  // @param email Email to remove from admin list
  static removeAdminEmail(email: string): void {
    const index = ADMIN_EMAILS.indexOf(email);
    if (index > -1) {
      ADMIN_EMAILS.splice(index, 1);
    }
  }

  // Get the current list of admin emails
  // @returns Array of admin emails
  static getAdminEmails(): string[] {
    return [...ADMIN_EMAILS];
  }

  // Create an authorization context
  // @param user User object
  // @param resourceOwnerId Optional resource owner ID
  // @returns AuthorizationContext
  static createContext(user: User | null, resourceOwnerId?: string): AuthorizationContext {
    // Ensure user is defined and return a valid context
    if (!user) {
      return { user: null, resourceOwnerId: undefined };
    }
    return { user, resourceOwnerId };
  }

  // Check if a user can create a post
  // @param user User object
  // @returns Boolean indicating permission
  static canCreatePost(user: User | null): boolean {
    const someValue = this.canAccess(this.createContext(user), UserRole.AUTHOR);
    return someValue !== null && someValue !== undefined ? someValue : false;
  }

  // Check if a user can edit a post
  // @param user User object
  // @param postAuthorId Post author ID
  // @returns Boolean indicating permission
  static canEditPost(user: User | null, postAuthorId?: string): boolean {
    const context = this.createContext(user, postAuthorId);
    // Ensure context is valid before proceeding
    if (!context) return false;
    return (
      this.canAccess(context, UserRole.EDITOR) ||
      (user && postAuthorId && user.uid === postAuthorId)
    );
  }

  // Check if a user can delete a post
  // @param user User object
  // @param postAuthorId Post author ID
  // @returns Boolean indicating permission
  static canDeletePost(user: User | null, postAuthorId?: string): boolean {
    const context = this.createContext(user, postAuthorId);
    // Ensure context is valid before proceeding
    if (!context) return false;
    return (
      this.canAccess(context, UserRole.ADMIN) ||
      (user && postAuthorId !== undefined && user.uid === postAuthorId)
    );
  }

  // Check if a user can manage users
  // @param user User object
  // @returns Boolean indicating permission
  static canManageUsers(user: User | null): boolean {
    return this.canAccess(this.createContext(user), UserRole.ADMIN);
  }

  // Check if a user can invite authors
  // @param user User object
  // @returns Boolean indicating permission
  static canInviteAuthors(user: User | null): boolean {
    return this.canAccess(this.createContext(user), UserRole.ADMIN);
  }
}

// Utility function to handle unauthorized access
// @param context Authorization context
// @param requiredRole Minimum role required
// @throws Error if access is not permitted
export function assertAuthorized(
  context: AuthorizationContext,
  requiredRole: UserRole = UserRole.USER
): void {
  if (!Authorization.canAccess(context, requiredRole)) {
    throw new Error('Unauthorized access');
  }
}
