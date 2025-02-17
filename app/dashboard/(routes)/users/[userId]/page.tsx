'use client';
import { useState, useEffect } from 'react';
import { User } from '@/app/types/user';
import { usersService } from '@/app/services/users';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserEditPage({ params }: { params: { userId: string } }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await usersService.getUser(params.userId);
                setUser(userData);
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [params.userId]);

    const handleClose = () => {
        setIsOpen(false);
    };

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