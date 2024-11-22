import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/app/firebase-admin';

const COOKIE_NAME = 'session';
const MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    const expiresIn = MAX_AGE * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, sessionCookie, {
      maxAge: MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    console.log('Session cookie set successfully');
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error setting session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
