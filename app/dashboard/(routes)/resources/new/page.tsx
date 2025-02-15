'use client';

import { withRoleProtection } from '@/app/lib/withRoleProtection';
import { UserRole } from '@/app/types/user';
import { ResourceEditor } from '@/app/dashboard/_components/ResourceEditor';
import { useAuthContext } from '@/lib/context/auth-context';

function NewResourcePage() {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      <ResourceEditor mode="create" />
    </div>
  );
}

export default withRoleProtection(NewResourcePage, UserRole.ADMIN);
