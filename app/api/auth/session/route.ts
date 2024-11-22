import { adminAuth } from '@/app/firebase-admin';
import { cookies } from 'next/headers';
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
      // First verify the ID token
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      console.log('ID Token verified for user:', decodedToken.uid);
      
      // Create session cookie
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      const sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn
      });
      
      if (!sessionCookie) {
        throw new Error('Failed to create session cookie');
      }

      // Set cookie options
      const cookieOptions = {
        name: 'session',
        value: sessionCookie,
        maxAge: expiresIn / 1000, // Convert to seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax' as const,
      };

      // Set the cookie
      const cookieStore = await cookies();
      cookieStore.set(cookieOptions);

      console.log('Session cookie created successfully for user:', decodedToken.uid);
      return NextResponse.json(
        { 
          status: 'success',
          uid: decodedToken.uid,
          // Include these for debugging
          cookieSet: true,
          expiresIn: expiresIn / 1000,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Firebase Auth error:', error?.message || error);
      if (error?.code === 'auth/invalid-id-token') {
        return NextResponse.json(
          { error: 'Invalid ID token' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Session creation error:', error?.message || error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error?.message,
        // Include these for debugging
        errorCode: error?.code,
        errorName: error?.name,
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    console.log('Session cookie deleted successfully');
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
