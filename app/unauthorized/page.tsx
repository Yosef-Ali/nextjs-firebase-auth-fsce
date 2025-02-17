'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md px-6 py-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">
            Sorry, you don't have permission to access the dashboard. Only
            administrators and authors can access this area.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {userData?.role || "No role assigned"}
          </p>
          <div className="flex flex-col w-full gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center justify-center w-full gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Home
            </Button>
            {user && (
              <p className="mt-2 text-sm text-gray-500">
                If you believe this is a mistake, please contact an
                administrator.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
