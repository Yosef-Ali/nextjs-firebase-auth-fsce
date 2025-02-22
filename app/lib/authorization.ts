import { User } from 'firebase/auth';
import { UserRole } from '@/app/types/user';
import { UserData } from './firebase/user';

const ROLE_HIERARCHY = {
  [UserRole.SUPER_ADMIN]: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER, UserRole.GUEST],
  [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER, UserRole.GUEST],
  [UserRole.AUTHOR]: [UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER, UserRole.GUEST],
  [UserRole.EDITOR]: [UserRole.EDITOR, UserRole.USER, UserRole.GUEST],
  [UserRole.USER]: [UserRole.USER, UserRole.GUEST],
  [UserRole.GUEST]: [UserRole.GUEST],
};

export class Authorization {
  private static instance: Authorization;
  private currentUser: User | null = null;

  private constructor() { }

  static getInstance(): Authorization {
    if (!Authorization.instance) {
      Authorization.instance = new Authorization();
    }
    return Authorization.instance;
  }

  static createContext(user: User | null): Authorization {
    const instance = Authorization.getInstance();
    instance.currentUser = user;
    return instance;
  }

  hasMinimumRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
    if (!userRole) return false;
    return ROLE_HIERARCHY[userRole]?.includes(requiredRole) ?? false;
  }

  hasRole(userData: UserData | null, requiredRole: UserRole): boolean {
    if (!userData) return false;
    return userData.role === requiredRole;
  }

  isAdmin(role: UserRole | undefined): boolean {
    return role === UserRole.ADMIN;
  }

  isUser(role: UserRole | undefined): boolean {
    return role === UserRole.USER;
  }

  canAccessResource(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
    return this.hasMinimumRole(userRole, requiredRole);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

// Export a default instance for convenience
export const authorization = Authorization.getInstance();
