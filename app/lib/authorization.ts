import { User as FirebaseUser } from 'firebase/auth';
import { AppUser as AppUserType, UserRole as AppUserRole, UserStatus } from '@/app/types/user';

// Role hierarchy definition - each role includes permissions of roles that come after it
const ROLE_HIERARCHY = {
  [AppUserRole.SUPER_ADMIN]: [AppUserRole.SUPER_ADMIN, AppUserRole.ADMIN, AppUserRole.AUTHOR, AppUserRole.EDITOR, AppUserRole.USER],
  [AppUserRole.ADMIN]: [AppUserRole.ADMIN, AppUserRole.AUTHOR, AppUserRole.EDITOR, AppUserRole.USER],
  [AppUserRole.AUTHOR]: [AppUserRole.AUTHOR, AppUserRole.EDITOR, AppUserRole.USER],
  [AppUserRole.EDITOR]: [AppUserRole.EDITOR, AppUserRole.USER],
  [AppUserRole.USER]: [AppUserRole.USER]
};

// Define a constant for admin emails that can be easily updated
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'dev.yosef@gmail.com',
  'yaredd.degefu@gmail.com',
  'mekdesyared@gmail.com'
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

  public isEditor(user: AppUserType | null): boolean {
    if (!user) return false;
    return this.hasRole(user, AppUserRole.EDITOR);
  }

  public canManageUsers(user: AppUserType | null): boolean {
    return this.isAdmin(user);
  }

  public canManageContent(user: AppUserType | null): boolean {
    return this.isAuthor(user) || this.isAdmin(user);
  }

  public canEditContent(user: AppUserType | null): boolean {
    return this.isEditor(user) || this.isAuthor(user) || this.isAdmin(user);
  }

  public canDeleteContent(user: AppUserType | null, authorId?: string): boolean {
    if (!user) return false;
    if (this.isAdmin(user)) return true;
    if (this.isAuthor(user) && authorId === user.uid) return true;
    return false;
  }

  public isActiveUser(user: AppUserType | null): boolean {
    return user?.status === UserStatus.ACTIVE;
  }

  public canAccessDashboard(user: AppUserType | null): boolean {
    return this.isActiveUser(user) && (this.isAuthor(user) || this.isAdmin(user));
  }

  public createContext(user: AppUserType | null, resourceOwnerId?: string): AuthorizationContext {
    return { user, resourceOwnerId };
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
