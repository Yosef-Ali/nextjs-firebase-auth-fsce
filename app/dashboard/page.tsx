'use client';

import { useAuthContext } from '@/lib/firebase/context';
import { LoadingScreen } from '@/components/loading-screen';

export default function DashboardPage() {
  const { loading, userData } = useAuthContext();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome {userData?.displayName}</h1>
      {/* Rest of dashboard content */}
    </div>
  );
}
