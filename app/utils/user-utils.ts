import { User, IdTokenResult } from 'firebase/auth';
import { AppUser, UserRole, UserStatus } from '@/app/types/user';
import crypto from 'crypto';

export function convertFirestoreDataToAppUser(data: any): AppUser {
  const now = Date.now();

  // Ensure required fields have proper default values
  const appUser: AppUser = {
    uid: data.uid || '',
    role: data.role || UserRole.USER,
    status: data.status || UserStatus.ACTIVE,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    email: data.email || '',
    displayName: data.displayName || '',
    photoURL: data.photoURL || null,
    emailVerified: Boolean(data.emailVerified),
    providerData: Array.isArray(data.providerData) ? data.providerData : [],
    refreshToken: data.refreshToken || null,
    tenantId: data.tenantId || null,
    phoneNumber: data.phoneNumber || null,
    id: data.uid || '',
    invitedBy: data.invitedBy || null,
    invitationToken: data.invitationToken || null,
    metadata: {
      lastLogin: typeof data.metadata?.lastLogin === 'number' ? data.metadata.lastLogin : now,
      createdAt: typeof data.metadata?.createdAt === 'number' ? data.metadata.createdAt : now,
      role: data.role || UserRole.USER,
      status: data.status || UserStatus.ACTIVE,
    },
    // Add required AppUser methods
    delete: () => Promise.resolve(),
    getIdToken: (forceRefresh?: boolean) => Promise.resolve(''),
    getIdTokenResult: (forceRefresh?: boolean) => Promise.resolve({} as IdTokenResult),
    reload: () => Promise.resolve(),
    toJSON: () => ({ ...appUser })
  };

  return appUser;
}

export const convertToAppUser = convertFirestoreDataToAppUser;

export function hasRole(user: AppUser | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

export function isActiveUser(user: AppUser | null): boolean {
  if (!user) return false;
  return user.status === UserStatus.ACTIVE && user.emailVerified;
}

/**
 * Formats user display name
 */
export function formatUserName(user: AppUser | null): string {
  if (!user) return 'Guest';
  return user.displayName || user.email?.split('@')[0] || 'Anonymous User';
}

/**
 * Gets user's primary email
 */
export function getPrimaryEmail(user: AppUser): string | null {
  // First check the main email
  if (user.email) return user.email;

  // Then check provider data
  const emailProvider = user.providerData.find(provider => provider.email);
  return emailProvider?.email || null;
}

/**
 * Gets user's avatar URL
 */
export function getUserAvatar(user: AppUser): string {
  if (user.photoURL) return user.photoURL;

  // Default to Gravatar if email exists
  const email = getPrimaryEmail(user);
  if (email) {
    const md5 = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    return `https://www.gravatar.com/avatar/${md5}?d=mp`;
  }

  return '/images/default-avatar.png'; // Fallback to default avatar
}
