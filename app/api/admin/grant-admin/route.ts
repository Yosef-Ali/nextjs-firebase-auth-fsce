import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/app/lib/firebase-admin';
import { ADMIN_EMAILS } from '@/app/lib/firebase/user';
import { UserRole } from '@/app/types/user';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized to grant admin access' },
        { status: 403 }
      );
    }

    const user = await adminAuth.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update custom claims
    await adminAuth.setCustomUserClaims(user.uid, {
      role: UserRole.ADMIN
    });

    // Update user document in Firestore
    await adminDb.collection('users').doc(user.uid).update({
      role: UserRole.ADMIN,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Admin access granted successfully'
    });
  } catch (error) {
    console.error('Error granting admin access:', error);
    return NextResponse.json(
      { error: 'Failed to grant admin access' },
      { status: 500 }
    );
  }
}
