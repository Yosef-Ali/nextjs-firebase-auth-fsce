'use client';

import { useAuthContext } from '@/lib/firebase/context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/firebase/context";

const PUBLIC_ROUTES = ['/login', '/sign-in', '/sign-up', '/reset-password'];

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !PUBLIC_ROUTES.includes(pathname ?? '')) {
            if (!user && pathname?.startsWith('/dashboard')) {
                router.replace('/sign-in');
            }
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
    );
}
