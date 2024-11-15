'use client';

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/app/(marketing)/navigation-menu";
import { menuItems } from '@/app/lib/menuItems';

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
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
  const { user, logout } = useAuth();

  return (
    <div className="w-full border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Logo - Fixed width on the left */}
          <div className="w-48">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">FSCE</span>
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
                        <NavigationMenuTrigger className="px-3">{item.title}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
                        <NavigationMenuLink className={`${navigationMenuTriggerStyle()} px-3`}>
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
          <div className="w-48 flex justify-end">
            {user ? (
              <button
                onClick={logout}
                className={navigationMenuTriggerStyle()}
              >
                Sign Out
              </button>
            ) : (
              <Link href="/sign-in" className={navigationMenuTriggerStyle()}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
