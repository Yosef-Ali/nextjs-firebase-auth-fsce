import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/app/firebase-admin';

const COOKIE_NAME = 'session';
const MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    // Create a session cookie using the Firebase Admin SDK
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: MAX_AGE * 1000, // Firebase uses milliseconds
    });

    // Set the session cookie
    cookies().set(COOKIE_NAME, sessionCookie, {
      maxAge: MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
