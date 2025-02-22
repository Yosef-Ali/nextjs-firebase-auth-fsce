import { User } from 'firebase/auth';
import { db } from './index';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole } from '@/app/types/user';

// List of admin emails for quick access control
export const ADMIN_EMAILS = [
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    'dev.yosefali@gmail.com',
    'yaredd.degefu@gmail.com',
    'mekdesyared@gmail.com'
].filter(Boolean) as string[];

// Basic user data interface
export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    createdAt: string;
}

// Basic user service functions
export async function getUserData(user: User): Promise<UserData | null> {
    try {
        // Check if user email is in admin list
        const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);
        const userData: UserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email || 'Anonymous User',
            photoURL: user.photoURL,
            role: isAdmin ? UserRole.ADMIN : UserRole.USER,
            createdAt: new Date().toISOString(),
        };

        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
        return userData;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

export async function getStoredUserData(uid: string): Promise<UserData | null> {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data() as UserData;
        }
        return null;
    } catch (error) {
        console.error('Error fetching stored user data:', error);
        return null;
    }
}
