import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { onAuthStateChanged } from 'firebase/auth';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        return NextResponse.json({ 
          isValid: true,
          uid: user.uid,
          email: user.email
        });
      } else {
        return NextResponse.json({ 
          isValid: false,
          error: 'Invalid session'
        }, { status: 401 });
      }
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ 
      isValid: false,
      error: 'Authentication failed'
    }, { status: 500 });
  }
}
