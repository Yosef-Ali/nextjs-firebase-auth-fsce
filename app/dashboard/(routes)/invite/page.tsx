'use client';

import { withRoleProtection } from '@/app/lib/withRoleProtection';
import { UserRole } from '@/app/types/user';
import { InviteForm } from '@/app/dashboard/_components/InviteForm';

function InvitePage() {
  return <InviteForm />;
}

export default withRoleProtection(InvitePage, UserRole.ADMIN);
