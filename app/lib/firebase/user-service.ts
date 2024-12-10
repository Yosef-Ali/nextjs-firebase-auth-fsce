import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { UserRole, UserStatus } from '@/app/types/user';

// Define admin emails
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'dev.yosefali@gmail.com',
  'yosefmdsc@gmail.com'
].filter(Boolean) as string[];

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export type UserStatus = 'active' | 'pending' | 'suspended';

export async function getUserData(user: User): Promise<UserData | null> {
  try {
    const db = getFirestore();
    
    // Check if user email is in admin list
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      const adminData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        createdAt: new Date().toISOString(),
      };
      // Ensure admin data is saved
      await setDoc(doc(db, 'users', user.uid), adminData, { merge: true });
      return adminData;
    }

    // Check regular users collection
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      // Double-check if user should be admin
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        userData.role = UserRole.ADMIN;
        userData.status = UserStatus.ACTIVE;
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      }
      return userData;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export async function createUserData(user: User, displayName: string): Promise<UserData> {
  try {
    const db = getFirestore();
    
    // Check if user email is in admin list
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      const adminData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid), adminData);
      return adminData;
    }

    // Check if user already exists in users collection
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }

    // Check dashboard_users collection
    const dashboardDoc = await getDoc(doc(db, 'dashboard_users', user.uid));
    if (dashboardDoc.exists()) {
      const data = dashboardDoc.data() as UserData;
      await setDoc(doc(db, 'users', user.uid), data);
      return data;
    }

    // Regular user data
    const userData: UserData = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName,
      role: UserRole.USER,
      status: UserStatus.PENDING,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    return userData;
  } catch (error) {
    console.error('Error creating user data:', error);
    throw new Error('Failed to create user data');
  }
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

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  try {
    const db = getFirestore();
    await updateDoc(doc(db, 'users', uid), { role });
  } catch (error) {
    console.error('Error updating user role:', error);
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
