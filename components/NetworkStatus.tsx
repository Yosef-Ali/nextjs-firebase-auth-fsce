'use client';

import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        function handleOnline() {
            setIsOnline(true);
            toast({
                title: "Connection Restored",
                description: "You are now back online.",
                variant: "default",
            });
        }

        function handleOffline() {
            setIsOnline(false);
            toast({
                title: "Connection Lost",
                description: "You are currently offline. Some features may be limited.",
                variant: "destructive",
                duration: 5000,
            });
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Only render something when offline
    if (isOnline) return null;

    return (
        <div className="fixed z-50 px-4 py-3 text-yellow-700 bg-yellow-100 border border-yellow-400 rounded-md shadow-lg bottom-4 right-4">
            <p className="font-medium">You&apos;re offline</p>
            <p className="text-sm">Some features may be limited until connection is restored</p>
        </div>
    );
}
