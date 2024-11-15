'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';

export default function Navigation() {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-sm font-medium text-destructive hover:text-destructive/90 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
