'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Search, 
  Settings,
  User,
  LogOut,
  Menu,
} from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSidebar } from '@/app/context/sidebar-context';
import { useSearch } from '@/app/context/search-context';

const DashboardHeader = () => {
  const { signOut } = useAuth();
  const { toggleSidebar } = useSidebar();
  const { searchQuery, setSearchQuery } = useSearch();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [notifications] = useState([
    { id: 1, text: 'New comment on your post', time: '5m ago' },
    { id: 2, text: 'Your post is trending', time: '1h ago' },
    { id: 3, text: 'Weekly analytics report', time: '1d ago' },
  ]);

  // Custom debounce implementation using useCallback and useRef
  const timeoutRef = useRef<NodeJS.Timeout>();
  const debouncedSetSearchQuery = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setSearchQuery(query);
      }, 300);
    },
    [setSearchQuery]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle local search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    debouncedSetSearchQuery(query);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Button
          variant="ghost"
          className="mr-4 px-2"
          onClick={() => toggleSidebar()}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8"
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id}>
                    <div className="flex flex-col">
                      <span>{notification.text}</span>
                      <span className="text-xs text-gray-500">
                        {notification.time}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
