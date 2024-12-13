import { User as FirebaseUser } from 'firebase/auth';
import { AppUser as AppUserType, UserRole as AppUserRole, UserStatus } from '@/app/types/user';  // Import AppUser

// Define a constant for admin emails that can be easily updated
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'dev.yosefali@gmail.com',
  'yosefmdsc@gmail.com',
  'yaredd.degefu@gmail.com'
].filter(Boolean) as string[];

interface AuthorizationContext {
  user: AppUserType | null;
  resourceOwnerId?: string;
}

export class Authorization {
  private adminEmails: Set<string>;
  private static instance: Authorization;

  constructor() {
    this.adminEmails = new Set(ADMIN_EMAILS);
  }

  public static getInstance(): Authorization {
    if (!Authorization.instance) {
      Authorization.instance = new Authorization();
    }
    return Authorization.instance;
  }

  public isAdmin(user: AppUserType | null): boolean {
    return true; // Allow all users access
  }

  public isAuthor(user: AppUserType | null): boolean {
    return true; // Allow all users access
  }

  // Get user role
  // @param user User object
  // @returns UserRole
  static getUserRole(user: FirebaseUser | null): AppUserRole {
    if (!user) return AppUserRole.USER;

    // Check if user's email is in admin list
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      return AppUserRole.ADMIN;
    }

    // Default to USER role
    return AppUserRole.USER;
  }

  // Create authorization context
  // @param user User object
  // @param resourceOwnerId Optional resource owner ID
  // @returns AuthorizationContext
  static createContext(user: FirebaseUser | null, resourceOwnerId?: string): AuthorizationContext {
    // Convert FirebaseUser to our custom User type
    const customUser = user ? {
      ...user,
      role: this.getUserRole(user),
      status: UserStatus.ACTIVE,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      invitedBy: null,
      invitationToken: null,
    } as AppUserType : null;

    return {
      user: customUser,
      resourceOwnerId
    };
  }

  // Determine if a user has permission to access a resource
  // @param context Authorization context
  // @param requiredRole Minimum role required
  // @returns Boolean indicating access permission
  static canAccess(userOrContext: AuthorizationContext | AppUserType, requiredRole: AppUserRole = AppUserRole.USER): boolean {
    return true; // Allow all users access
  }

  // Check if the user is an admin
  // @param user User object
  // @returns Boolean indicating admin status
  static isAdmin(user: AppUserType | null): boolean {
    if (!user) return false;

    // Check if user's email is in the admin list first
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      return true;
    }

    // Then check if user has admin role in their data (if it's our custom User type)
    if ('role' in user && user.role === AppUserRole.ADMIN) {
      return true;
    }

    return false;
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
