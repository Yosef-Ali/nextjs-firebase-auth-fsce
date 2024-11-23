import { auth } from '@/app/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;
    
    if (!idToken) {
      console.error('No ID token provided');
      return NextResponse.json(
        { error: 'ID Token Required' },
        { status: 400 }
      );
    }

    try {
      // Verify the ID token
      const decodedToken = await auth.verifyIdToken(idToken);
      
      // Create a session cookie
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      
      // Set the cookie
      const response = NextResponse.json({ status: 'success' });
      response.cookies.set('session', sessionCookie, {
        maxAge: expiresIn / 1000, // Convert to seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      return response;
    } catch (error) {
      console.error('Error creating session:', error);
      return NextResponse.json(
        { error: 'Invalid ID token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/auth/session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    
    return NextResponse.json({
      authenticated: true,
      decodedClaims,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ status: 'success' });
    response.cookies.delete('session');
    return response;
  } catch (error) {
    console.error('Error in DELETE /api/auth/session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
