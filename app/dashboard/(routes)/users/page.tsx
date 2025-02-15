'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { withRoleProtection } from '@/app/lib/withRoleProtection';
import { UserRole } from '@/app/types/user';
import { UsersTable } from '@/app/dashboard/_components/UsersTable';

function UsersPage() {
  return (
    <div className="container mx-auto space-y-8 p-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            User Management
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Manage user accounts, roles, and permissions. View and modify user information, update roles, and handle account access.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border rounded-lg shadow-sm bg-transparent">
        <CardHeader className="border-b rounded-t-lg">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Users</h3>
        </CardHeader>
        <UsersTable />
      </Card>
    </div>
  );
}

export default withRoleProtection(UsersPage, UserRole.ADMIN);
