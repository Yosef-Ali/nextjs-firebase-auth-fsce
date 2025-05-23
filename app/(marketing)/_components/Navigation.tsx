'use client';

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserRole } from "@/app/types/user";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { menuItems } from '@/lib/menuItems';
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-50/80 hover:text-primary ${className}`}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function Navigation() {
  const { user, userData, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const canAccessDashboard = userData?.role === UserRole.ADMIN || userData?.role === UserRole.AUTHOR;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 bg-white/75 border-b",
      isScrolled
        ? "backdrop-blur-md shadow-sm"
        : ""
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Logo - Fixed width on the left */}
          <div className="w-48">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/Logo.svg"
                alt="FSCE Logo"
                width={80}
                height={32}
                priority
                className="object-contain w-auto h-8"
              />
            </Link>
          </div>

          {/* Centered Navigation */}
          <div className="flex-1 flex justify-center">
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList className="flex">
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>{item.title}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white shadow-lg rounded-lg">
                            {item.items.map((subItem) => (
                              <ListItem
                                key={subItem.title}
                                title={subItem.title}
                                href={subItem.href}
                              >
                                {subItem.description}
                              </ListItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link href={item.href ?? ''} legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                          {item.title}
                        </NavigationMenuLink>
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Sign Out/Login - Fixed width on the right */}
          <div className="w-48 flex justify-end gap-2 items-center">
            {user ? (
              <>
                {canAccessDashboard && (
                  <Link
                    href="/dashboard"
                    className={navigationMenuTriggerStyle()}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className={navigationMenuTriggerStyle()}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/sign-in" className={navigationMenuTriggerStyle()}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
