import { User, IdTokenResult } from 'firebase/auth';
import { AppUser, UserRole, UserStatus } from '@/app/types/user';
import crypto from 'crypto';

export function convertFirestoreDataToAppUser(data: any): AppUser {
  const now = Date.now();

  const appUser: AppUser = {
    uid: data.uid || '',
    role: data.role || UserRole.USER,
    status: data.status || UserStatus.ACTIVE,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    email: data.email || '',
    displayName: data.displayName || '',
    photoURL: data.photoURL || null,
    emailVerified: Boolean(data.emailVerified),
    isAnonymous: Boolean(data.isAnonymous),
    providerData: Array.isArray(data.providerData) ? data.providerData : [],
    refreshToken: data.refreshToken || '',
    tenantId: data.tenantId || null,
    phoneNumber: data.phoneNumber || null,
    id: data.uid || '',  // Adding required id field
    invitedBy: data.invitedBy || null,  // Adding required invitedBy field
    invitationToken: data.invitationToken || null,  // Adding required invitationToken field
    metadata: {
      lastLogin: data.metadata?.lastLogin || now,
      createdAt: data.metadata?.createdAt || now,
      role: data.role || UserRole.USER,
      status: data.status || UserStatus.ACTIVE,
      displayName: data.displayName || '',
      email: data.email || '',
      photoURL: data.photoURL || null,
      uid: data.uid || '',
      emailVerified: Boolean(data.emailVerified),
      providerData: data.providerData || [],
      refreshToken: data.refreshToken || '',
      phoneNumber: data.phoneNumber || null,
      tenantId: data.tenantId || null
    },
    delete: () => Promise.resolve(),
    getIdToken: () => Promise.resolve(''),
    getIdTokenResult: () => Promise.resolve({} as IdTokenResult),
    reload: () => Promise.resolve(),
    toJSON: () => ({})
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
