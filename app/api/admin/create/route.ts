import { NextResponse } from 'next/server';
import { auth as adminAuth, db } from '@/app/firebase-admin';
import { UserRole } from '@/app/lib/authorization';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      emailVerified: true,
    });

    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: UserRole.ADMIN,
      status: 'active'
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      displayName: email.split('@')[0],
      role: UserRole.ADMIN,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      uid: userRecord.uid 
    });

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
