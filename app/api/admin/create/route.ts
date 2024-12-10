import { NextResponse } from 'next/server';
import { createAdminUser } from '@/app/lib/services/admin';
import { UserRole } from '@/app/types/user';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const userRecord = await createAdminUser(email, password, {
      role: UserRole.ADMIN,
      status: 'active'
    });

    return NextResponse.json({ 
      success: true, 
      user: userRecord 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create admin user' },
      { status: 400 }
    );
  }
}
