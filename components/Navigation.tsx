'use client';

import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/app/lib/firebase/context';
import { cn } from "@/lib/utils";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Logo } from "./Logo";

export function Navigation() {
  const pathname = usePathname();
  const { user, userData } = useAuthContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <NavigationMenu className="hidden md:flex">
          <Logo />
        </NavigationMenu>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search component can go here */}
          </div>
          <nav className="flex items-center space-x-2">
            {user ? (
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-foreground/60 hover:text-foreground"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="text-foreground/60 hover:text-foreground"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
