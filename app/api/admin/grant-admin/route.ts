import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/app/lib/services/admin';
import { ADMIN_EMAILS } from '@/app/lib/firebase/user-service';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Verify if the email is in the admin list
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Email is not in the admin list' },
        { status: 400 }
      );
    }

    // Get the user by email
    const userRecord = await adminAuth.getUserByEmail(email);

    // Set custom claims for admin role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'admin' });

    // Update user document in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      email: email,
      role: 'admin',
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error granting admin role:', error);
    return NextResponse.json(
      { error: 'Failed to grant admin role' },
      { status: 500 }
    );
  }
}
