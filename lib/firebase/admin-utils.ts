import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { UserRole, UserStatus } from '@/app/types/user';
import { db } from '@/lib/firebase';

export async function forceUpdateAdminRole(uid: string, email: string) {
  try {
    const adminData = {
      uid,
      email,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'users', uid), adminData, { merge: true });
    console.log('Successfully updated admin role for:', email);
    return true;
  } catch (error) {
    console.error('Error updating admin role:', error);
    return false;
  }
}
