'use client';

import Auth from '@/components/Auth';
import AuthRedirectHandler from '@/components/auth/AuthRedirectHandler';
import { Logo } from '@/components/Logo';
import { AuthProvider } from '@/lib/context/auth-context';

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center">
            <Logo className="h-12 w-auto" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <Auth />
          <AuthRedirectHandler />
        </div>
      </div>
    </AuthProvider>
  );
}
