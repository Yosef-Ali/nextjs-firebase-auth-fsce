"use strict"

import { AppUser, UserRole, UserStatus, ExtendedUserMetadata } from "@/app/types/user";
import { User as FirebaseUser } from "firebase/auth";

export function convertToAppUser(rawUser: FirebaseUser | null): AppUser | null {
  if (!rawUser) return null;

  // Keep the original Firebase metadata and methods
  const baseMetadata = rawUser.metadata || {};
  const extendedMetadata: ExtendedUserMetadata = {
    ...baseMetadata,
    lastLogin: baseMetadata.lastSignInTime ? new Date(baseMetadata.lastSignInTime).getTime() : Date.now(),
    createdAt: baseMetadata.creationTime ? new Date(baseMetadata.creationTime).getTime() : Date.now()
  };

  // Spread all Firebase user properties and add our custom properties
  return {
    ...rawUser,
    role: (rawUser as any).role || UserRole.USER,
    status: (rawUser as any).status || UserStatus.ACTIVE,
    createdAt: (rawUser as any).createdAt || Date.now(),
    updatedAt: (rawUser as any).updatedAt || Date.now(),
    metadata: extendedMetadata,
    invitedBy: (rawUser as any).invitedBy || null,
    invitationToken: (rawUser as any).invitationToken || null
  } as AppUser;
}
