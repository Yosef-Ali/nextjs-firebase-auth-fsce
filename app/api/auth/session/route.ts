import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { onAuthStateChanged } from 'firebase/auth';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        return NextResponse.json({
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified
          }
        });
      } else {
        return NextResponse.json({ user: null });
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}

export async function DELETE() {
  try {
    await auth.signOut();
    const response = NextResponse.json({ status: 'success' });
    response.cookies.delete('auth-token');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
