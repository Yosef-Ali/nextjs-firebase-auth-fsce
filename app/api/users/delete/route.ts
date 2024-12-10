import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { deleteUser, signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Delete from Firestore first
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await deleteDoc(userDoc.ref);
        console.log('Deleted user from Firestore:', email);
      }
    } catch (error: any) {
      console.error('Error deleting from Firestore:', error);
      return NextResponse.json(
        { error: `Firestore deletion failed: ${error.message}` },
        { status: 500 }
      );
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
