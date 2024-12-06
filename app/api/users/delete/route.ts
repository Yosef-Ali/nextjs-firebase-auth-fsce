import { NextResponse } from 'next/server';
import { db } from '@/app/firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/app/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Delete from Firebase Auth using Admin SDK
    try {
      const auth = getAuth();
      const user = await auth.getUserByEmail(email);
      if (user) {
        await auth.deleteUser(user.uid);
        console.log('Deleted user from Firebase Auth:', email);
      }
    } catch (error: any) {
      console.error('Error deleting from Firebase Auth:', error);
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Delete from Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await deleteDoc(userDoc.ref);
      console.log('Deleted user from Firestore:', email);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete user API:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
