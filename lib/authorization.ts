import { User } from 'firebase/auth';

// Define a constant for admin emails that can be easily updated
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL, 
  'dev.yosefali@gmail.com'
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
  private static instance: Authorization;

  private constructor() {}

  static getInstance(): Authorization {
    if (!Authorization.instance) {
      Authorization.instance = new Authorization();
    }
    return Authorization.instance;
  }

  canAccess(context: AuthorizationContext, requiredRole: UserRole = UserRole.USER): boolean {
    if (!context.user && requiredRole !== UserRole.GUEST) {
      return false;
    }

    const userRole = this.getUserRole(context.user);

    // Admin has access to everything
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Define role hierarchy
    const roleHierarchy: Record<UserRole, UserRole[]> = {
      [UserRole.ADMIN]: [UserRole.ADMIN],
      [UserRole.AUTHOR]: [UserRole.ADMIN, UserRole.AUTHOR],
      [UserRole.EDITOR]: [UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR],
      [UserRole.USER]: [UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER],
      [UserRole.GUEST]: [UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER, UserRole.GUEST]
    };

    // Check if user's role is included in the required role's hierarchy
    return roleHierarchy[requiredRole].includes(userRole);
  }

  isAdmin(user: User | null): boolean {
    if (!user?.email) return false;
    return ADMIN_EMAILS.includes(user.email);
  }

  getUserRole(user: User | null): UserRole {
    if (!user) {
      return UserRole.GUEST;
    }

    if (this.isAdmin(user)) {
      return UserRole.ADMIN;
    }

    // Add additional role checks here
    // For example, check Firestore for user roles

    return UserRole.USER;
  }

  addAdminEmail(email: string): void {
    if (!ADMIN_EMAILS.includes(email)) {
      ADMIN_EMAILS.push(email);
    }
  }

  removeAdminEmail(email: string): void {
    const index = ADMIN_EMAILS.indexOf(email);
    if (index > -1) {
      ADMIN_EMAILS.splice(index, 1);
    }
  }

  getAdminEmails(): string[] {
    return [...ADMIN_EMAILS];
  }

  createContext(user: User | null, resourceOwnerId?: string): AuthorizationContext {
    return { user, resourceOwnerId };
  }

  canCreatePost(user: User | null): boolean {
    return this.canAccess(this.createContext(user), UserRole.AUTHOR);
  }

  canEditPost(user: User | null, postAuthorId?: string): boolean {
    const context = this.createContext(user, postAuthorId);
    
    // Admins can edit any post
    if (this.isAdmin(user)) {
      return true;
    }

    // Authors can edit their own posts
    if (user && postAuthorId && user.uid === postAuthorId) {
      return true;
    }

    // Editors can edit posts
    return this.canAccess(context, UserRole.EDITOR);
  }

  canDeletePost(user: User | null, postAuthorId?: string): boolean {
    const context = this.createContext(user, postAuthorId);
    
    // Admins can delete any post
    if (this.isAdmin(user)) {
      return true;
    }

    // Authors can delete their own posts
    if (user && postAuthorId && user.uid === postAuthorId) {
      return true;
    }

    return false;
  }

  canManageUsers(user: User | null): boolean {
    return this.canAccess(this.createContext(user), UserRole.ADMIN);
  }

  canInviteAuthors(user: User | null): boolean {
    return this.canAccess(this.createContext(user), UserRole.ADMIN);
  }
}

// Export a singleton instance
export const authorization = Authorization.getInstance();

// Utility function to handle unauthorized access
export function assertAuthorized(context: AuthorizationContext, requiredRole: UserRole = UserRole.USER): void {
  const auth = Authorization.getInstance();
  if (!auth.canAccess(context, requiredRole)) {
    throw new Error('Unauthorized access');
  }
}
