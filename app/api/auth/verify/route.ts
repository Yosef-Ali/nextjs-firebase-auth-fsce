import { auth } from '@/app/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get the session cookie from the request cookies
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    try {
      // Verify the session cookie
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
      
      return NextResponse.json({ 
        isValid: true,
        uid: decodedClaims.uid,
        email: decodedClaims.email
      });
    } catch (error) {
      console.error('Session verification error:', error);
      return NextResponse.json({ 
        isValid: false,
        error: 'Invalid session'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      isValid: false,
      error: 'Server error'
    }, { status: 500 });
  }
}
