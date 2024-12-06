'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/firebase/auth-context';
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription className="mt-2">
            You don't have permission to access this area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <Lock className="mx-auto h-12 w-12 text-red-500" />
            <p className="text-sm text-muted-foreground">
              This area is restricted to authorized users only. Please sign in with a Firebase account that has the required permissions.
            </p>
          </div>
          <div className="space-y-2">
            <Button
              variant="default"
              className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
              onClick={handleGoHome}
            >
              Go to Homepage
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
