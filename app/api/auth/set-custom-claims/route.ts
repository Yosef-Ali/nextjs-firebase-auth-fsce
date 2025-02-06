import { NextResponse } from 'next/server';

import { UserRole } from '@/app/types/user';
import { adminAuth } from '@/app/lib/services/admin';

export async function POST(request: Request) {
  try {
    const { uid, claims } = await request.json();

    if (!uid || !claims || !claims.role) {
      const error = {
        code: 'missing_fields',
        message: 'Missing required fields',
        details: { uid, claims }
      };
      console.error('Error setting custom claims:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }

    // Validate that the role is a valid UserRole
    if (!Object.values(UserRole).includes(claims.role)) {
      const error = {
        code: 'invalid_role',
        message: 'Invalid role',
        details: { 
          providedRole: claims.role,
          validRoles: Object.values(UserRole)
        }
      };
      console.error('Error setting custom claims:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }

    try {
      // Verify user exists before setting claims
      const user = await adminAuth.getUser(uid);
      
      // Set custom claims using adminAuth
      await adminAuth.setCustomUserClaims(uid, claims);
      
      return NextResponse.json({ 
        success: true,
        details: {
          uid,
          role: claims.role,
          email: user.email
        }
      });
    } catch (error: any) {
      const errorDetails = {
        code: error.code || 'unknown_error',
        message: error.message || 'Error setting custom claims',
        details: {
          uid,
          claims,
          errorInfo: error.errorInfo || error
        }
      };
      console.error('Error setting custom claims:', errorDetails);
      
      // Handle specific Firebase Admin errors
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json({ error: 'User not found', details: errorDetails }, { status: 404 });
      }
      
      return NextResponse.json({ error: errorDetails.message, details: errorDetails }, { status: 500 });
    }
  } catch (error: any) {
    const errorDetails = {
      code: 'request_error',
      message: error.message || 'Error processing request',
      details: { error }
    };
    console.error('Error in set-custom-claims route:', errorDetails);
    return NextResponse.json({ error: errorDetails.message, details: errorDetails }, { status: 500 });
  }
}
