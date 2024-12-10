import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Test Firebase Auth configuration
    const config = auth.app.options;
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Firebase Auth is working',
      projectId: config.projectId,
      authDomain: config.authDomain,
      apiKeyExists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    }, { status: 200 });
  } catch (error: any) {
    console.error('Firebase Auth test failed:', error);
    
    return NextResponse.json({ 
      status: 'error',
      message: 'Firebase Auth test failed',
      error: error.message,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      stack: error.stack
    }, { status: 500 });
  }
}
