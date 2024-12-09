import { User } from 'firebase/auth';

export class Authorization {
  static isAdmin(user: User | null): boolean {
    // You can implement your admin check logic here
    // For example, checking custom claims or email domain
    return false;
  }

  static async hasRole(user: User | null, role: string): Promise<boolean> {
    if (!user) return false;
    
    // You can implement your role checking logic here
    // For example, checking custom claims or a database
    switch (role.toLowerCase()) {
      case 'admin':
        return this.isAdmin(user);
      case 'author':
        return true; // Implement your author check logic
      case 'user':
        return true; // All authenticated users have basic user role
      default:
        return false;
    }
  }

  static canManageUsers(user: User | null): boolean {
    // Only admins can manage users by default
    return this.isAdmin(user);
  }

  static async canEditContent(user: User | null): Promise<boolean> {
    // Authors and admins can edit content
    if (!user) return false;
    return this.hasRole(user, 'author') || this.isAdmin(user);
  }

  static async canDeleteContent(user: User | null): Promise<boolean> {
    // Only admins can delete content by default
    return this.isAdmin(user);
  }
}
