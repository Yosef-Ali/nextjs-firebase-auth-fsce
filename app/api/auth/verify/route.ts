import { adminAuth } from '@/app/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body?.sessionCookie) {
      console.error('No session cookie provided');
      return NextResponse.json(
        { isValid: false, error: 'No session cookie provided' },
        { status: 401 }
      );
    }

    try {
      // Verify the session cookie with a 5-second timeout
      const decodedClaims = await Promise.race([
        adminAuth.verifySessionCookie(body.sessionCookie, true),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session verification timeout')), 5000)
        )
      ]);
      
      console.log('Session verified for user:', decodedClaims.uid);
      return NextResponse.json(
        { isValid: true, uid: decodedClaims.uid },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Session verification error:', error?.message || error);
      
      // Handle specific Firebase Auth errors
      if (error?.code === 'auth/session-cookie-expired') {
        return NextResponse.json(
          { 
            isValid: false, 
            error: 'Session expired',
            code: 'SESSION_EXPIRED'
          },
          { status: 401 }
        );
      }

      if (error?.message === 'Session verification timeout') {
        return NextResponse.json(
          { 
            isValid: false, 
            error: 'Session verification timed out',
            code: 'TIMEOUT'
          },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { 
          isValid: false, 
          error: 'Invalid session',
          code: 'INVALID_SESSION'
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Session verification error:', error?.message || error);
    return NextResponse.json(
      { 
        isValid: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error?.message
      },
      { status: 500 }
    );
  }
}
