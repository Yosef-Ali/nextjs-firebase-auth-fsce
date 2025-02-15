'use client';

import Link from 'next/link';
import { useAuth } from '@/app/hooks/use-auth';
import { Logo } from './Logo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { menuItems } from '@/lib/menuItems';
import { Button } from './ui/button';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const isActive = (path: string) => pathname === path;

  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isSubmenuExpanded = (title: string) => expandedMenus.includes(title);

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
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
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard/posts" passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    'text-sm font-medium hidden md:inline-flex',
                    isActive('/dashboard/posts') ? 'text-primary' : ''
                  )}
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={() => signOut()}
                variant="ghost"
                className="text-sm font-medium"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/sign-in" passHref>
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <div key={item.title} className="space-y-1">
                {item.items ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium',
                        isActive(item.href || '') ? 'bg-accent text-primary' : 'text-foreground/60'
                      )}
                    >
                      <span>{item.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isSubmenuExpanded(item.title) ? 'transform rotate-180' : ''
                        )}
                      />
                    </button>
                    {isSubmenuExpanded(item.title) && (
                      <div className="pl-4 space-y-1">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'block px-3 py-2 rounded-md text-sm font-medium',
                              isActive(subItem.href) ? 'bg-accent/50 text-primary' : 'text-foreground/60'
                            )}
                          >
                            <div className="font-medium">{subItem.title}</div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {subItem.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || ''}
                    className={cn(
                      'block px-3 py-2 rounded-md text-base font-medium',
                      isActive(item.href || '') ? 'bg-accent text-primary' : 'text-foreground/60'
                    )}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
            {user && (
              <Link
                href="/dashboard/posts"
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  isActive('/dashboard/posts') ? 'bg-accent text-primary' : 'text-foreground/60'
                )}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
