'use client';

import { UserRole } from '@/app/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>Total Users: 150</li>
              <li>Active Users: 87</li>
              <li>Pending Registrations: 12</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>User John Doe registered</li>
              <li>Content update in About section</li>
              <li>System backup completed</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
