'use client';

import { withRoleProtection } from '@/app/lib/withRoleProtection';
import { UserRole } from '@/app/types/user';
import { AboutEditor } from '@/app/dashboard/_components/AboutEditor';

function AboutPage() {
  return <AboutEditor />;
}

export default withRoleProtection(AboutPage, UserRole.AUTHOR);
