'use client';

import { useState, useEffect } from 'react';
import { User } from '@/app/types/user';
import { usersService } from '@/app/services/users';
import { Skeleton } from '@/components/ui/skeleton';

interface UserPageClientProps {
    initialUser: User | null;
    userId: string;
}

export default function UserPageClient({ initialUser, userId }: UserPageClientProps) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [loading, setLoading] = useState(!initialUser);

    useEffect(() => {
        if (!initialUser) {
            const loadUser = async () => {
                try {
                    const userData = await usersService.getUser(userId);
                    setUser(userData);
                } catch (error) {
                    console.error('Error loading user:', error);
                } finally {
                    setLoading(false);
                }
            };
            loadUser();
        }
    }, [userId, initialUser]);

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto py-10">
                <div className="text-center">
                    <p>User not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Edit User</h1>
                {/* User details and edit form can be added here */}
            </div>
        </div>
    );
}