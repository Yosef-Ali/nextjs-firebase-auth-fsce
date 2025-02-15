import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { UserRole, UserStatus } from '@/app/types/user';

// Define admin emails from environment
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL
].filter(Boolean) as string[];

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
  metadata: {
    lastLogin: number;
    createdAt: number;
  };
}

export async function getUserData(user: User): Promise<UserData | null> {
  if (!user?.uid) {
    console.warn('No user or user ID provided to getUserData');
    return null;
  }

  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn(`User document does not exist for UID: ${user.uid}`);
      return null;
    }

    const userData = userDoc.data() as UserData;

    try {
      // Update last login in a separate try block to prevent data fetch failure
      await updateDoc(userDocRef, {
        'metadata.lastLogin': Date.now(),
        updatedAt: Date.now()
      });
    } catch (updateError) {
      // Log but don't fail if update fails
      console.warn(`Failed to update last login for user ${user.uid}:`, updateError);
    }

    return userData;
  } catch (error) {
    console.error(`Error in getUserData for UID ${user.uid}:`, error);
    return null;
  }
}

export async function createUserData(user: User, displayName: string): Promise<UserData> {
  if (!user?.uid) {
    throw new Error('Invalid user object provided to createUserData');
  }

  const db = getFirestore();
  const now = Date.now();

  const userData: UserData = {
    uid: user.uid,
    email: user.email || '',
    displayName: displayName || user.displayName || user.email || 'Unnamed User',
    role: user.email && ADMIN_EMAILS.includes(user.email.toLowerCase()) ? UserRole.ADMIN : UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
    metadata: {
      lastLogin: now,
      createdAt: now
    }
  };

  try {
    await setDoc(doc(db, 'users', user.uid), userData);
    return userData;
  } catch (error) {
    console.error(`Failed to create user data for UID ${user.uid}:`, error);
    throw new Error('Failed to create user data in Firestore');
  }
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const db = getFirestore();
  await updateDoc(doc(db, 'users', uid), {
    role,
    updatedAt: Date.now()
  });
}

export async function getAllUsers(): Promise<UserData[]> {
  const db = getFirestore();
  const usersSnapshot = await getDocs(collection(db, 'users'));
  return usersSnapshot.docs.map(doc => doc.data() as UserData);
}

export async function updateUserStatus(uid: string, status: UserStatus): Promise<void> {
  try {
    const db = getFirestore();
    await updateDoc(doc(db, 'users', uid), { status });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

export async function canAccessDashboard(user: User): Promise<boolean> {
  try {
    const userData = await getUserData(user);
    return userData?.status === UserStatus.ACTIVE && userData?.role === UserRole.ADMIN;
  } catch (error) {
    console.error('Error checking dashboard access:', error);
    return false;
  }
}
