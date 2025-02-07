import { Timestamp } from "firebase/firestore";
import { User, UserRole, UserStatus } from "../types/user";

export async function convertTimestamp(timestamp: any): Promise<number> {
  return timestamp?.toDate ? timestamp.toMillis() : Date.now();
}

export function createUserObject(
  uid: string,
  data: Partial<User> & { metadata?: any }
): User {
  const now = Date.now();

  // Convert Timestamp objects to milliseconds
  const createdAt =
    data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt
      ? (data.createdAt as Timestamp).toMillis()
      : data.createdAt ?? now;
  const updatedAt =
    data.updatedAt && typeof data.updatedAt === 'object' && 'toDate' in data.updatedAt
      ? (data.updatedAt as Timestamp).toMillis()
      : data.updatedAt ?? now;
  const lastLogin =
    data.metadata?.lastLogin && typeof data.metadata.lastLogin === 'object' && 'toDate' in data.metadata.lastLogin
      ? (data.metadata.lastLogin as Timestamp).toMillis()
      : data.metadata?.lastLogin ?? now;
  const metadataCreatedAt =
    data.metadata?.createdAt && typeof data.metadata.createdAt === 'object' && 'toDate' in data.metadata.createdAt
      ? (data.metadata.createdAt as Timestamp).toMillis()
      : data.metadata?.createdAt ?? createdAt;

  // Return only serializable properties
  return {
    uid,
    email: data.email ?? null,
    role: data.role ?? UserRole.USER,
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    createdAt,
    updatedAt,
    status: data.status ?? UserStatus.ACTIVE,
    invitedBy: data.invitedBy ?? null,
    invitationToken: data.invitationToken ?? null,
    emailVerified: false,
    metadata: {
      createdAt: metadataCreatedAt,
      lastLogin,
    },
  } as User;
}
