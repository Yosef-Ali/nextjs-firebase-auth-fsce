'use client';

import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { Logo } from './Logo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { menuItems } from '@/app/lib/menuItems';
import { Button } from './ui/button';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                {item.items ? (
                  <>
                    <NavigationMenuTrigger
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isActive(item.href || '') ? 'text-primary' : 'text-foreground/60'
                      )}
                    >
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                        {item.items.map((subItem) => (
                          <li key={subItem.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                                  isActive(subItem.href) ? 'bg-accent' : ''
                                )}
                              >
                                <div className="text-sm font-medium leading-none">
                                  {subItem.title}
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {subItem.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link
                    href={item.href || ''}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'text-sm font-medium transition-colors',
                      isActive(item.href || '') ? 'text-primary' : 'text-foreground/60'
                    )}
                  >
                    {item.title}
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    'text-sm font-medium',
                    isActive('/dashboard') ? 'text-primary' : ''
                  )}
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-sm font-medium text-destructive hover:text-destructive/90"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/sign-in" passHref>
              <Button
                variant="ghost"
                className="text-sm font-medium"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
