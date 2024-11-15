import { adminAuth } from '@/app/firebase-admin';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Try a simpler operation first - getting the tenant
    const tenantManager = await adminAuth.tenantManager();
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Firebase Admin is working',
      projectId: process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
    }, { status: 200 });
  } catch (error: any) {
    console.error('Firebase Admin test failed:', error);
    
    // Return detailed error information
    return NextResponse.json({ 
      status: 'error',
      message: 'Firebase Admin test failed',
      error: error.message,
      code: error.code,
      projectId: process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      stack: error.stack
    }, { status: 500 });
  }
}
