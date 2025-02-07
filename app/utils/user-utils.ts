"use strict"

import { AppUser, UserRole, UserStatus } from "@/app/types/user";

export function convertToAppUser(rawUser: any): AppUser | null {
  if (!rawUser) return null;

  return {
    uid: rawUser.uid,
    email: rawUser.email,
    displayName: rawUser.displayName || null,
    photoURL: rawUser.photoURL || null,
    emailVerified: rawUser.emailVerified || false,
    role: rawUser.role || UserRole.USER,
    status: rawUser.status || UserStatus.ACTIVE,
    createdAt: rawUser.createdAt && typeof rawUser.createdAt.toDate === "function"
      ? rawUser.createdAt.toDate()
      : rawUser.createdAt || new Date(),
    updatedAt: rawUser.updatedAt && typeof rawUser.updatedAt.toDate === "function"
      ? rawUser.updatedAt.toDate()
      : rawUser.updatedAt || new Date(),
    providerData: rawUser.providerData || [],
  };
}
