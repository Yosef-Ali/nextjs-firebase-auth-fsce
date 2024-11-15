'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useState } from 'react';
import Logo from '@/app/components/Logo';
import Navigation from '@/app/components/Navigation';

export default function SignInPage() {
  const { signInWithGoogle, loading, error } = useAuth();
  const [status, setStatus] = useState('');

  const handleSignIn = async () => {
    try {
      setStatus('Opening Google sign-in popup...');
      await signInWithGoogle();
      setStatus('Sign-in successful! Redirecting...');
    } catch (error) {
      setStatus('Sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-lg border border-border/50">
          <div className="flex flex-col items-center space-y-4">
            <Logo />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              Welcome Back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to access your account
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.27028 9.7049L1.28027 6.60986C0.47027 8.22986 0 10.0599 0 11.9999C0 13.9399 0.47027 15.7699 1.28027 17.3899L5.26498 14.2949Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0003 24C15.2353 24 17.9502 22.935 19.9452 21.095L16.0802 18.095C15.0002 18.82 13.6203 19.245 12.0003 19.245C8.87028 19.245 6.21525 17.135 5.26498 14.29L1.27527 17.385C3.25027 21.31 7.31028 24 12.0003 24Z"
                  fill="#34A853"
                />
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Show the current status */}
            {status && (
              <div className="text-sm text-center text-muted-foreground">
                {status}
              </div>
            )}

            {/* Show any errors */}
            {error && (
              <div className="text-sm text-center text-destructive">
                {error}
              </div>
            )}

            {/* Information Section */}
            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    About this app
                  </span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  This is a secure authentication system built with Next.js 13 and
                  Firebase Authentication.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Secure Google Sign-In</li>
                  <li>Protected Routes</li>
                  <li>Server-side Session Management</li>
                  <li>Modern UI with Tailwind CSS</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
