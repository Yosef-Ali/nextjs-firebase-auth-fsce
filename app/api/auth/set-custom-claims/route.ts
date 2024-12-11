import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/firebase-admin';
import { UserRole } from '@/app/types/user';

export async function POST(request: Request) {
  try {
    const { uid, claims } = await request.json();

    if (!uid || !claims || !claims.role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate that the role is a valid UserRole
    if (!Object.values(UserRole).includes(claims.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Set custom claims
    await auth.setCustomUserClaims(uid, claims);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
