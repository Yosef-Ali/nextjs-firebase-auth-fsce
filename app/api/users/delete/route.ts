import { NextResponse } from 'next/server';
import { adminAuth } from '@/app/lib/services/admin';

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete user from Firebase Authentication
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete user API:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
