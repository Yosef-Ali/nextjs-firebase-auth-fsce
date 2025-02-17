import { NextResponse } from 'next/server';
import { userInvitationService } from '@/app/services/users/invitation';
import { UserRole } from '@/app/types/user';

export async function POST(request: Request) {
  try {
    const { adminEmail, targetEmail, role } = await request.json();
    
    const result = await userInvitationService.inviteUser(adminEmail, targetEmail, role as UserRole);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}