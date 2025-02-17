'use client';
import { useState, useEffect } from 'react';
import { UserEditor } from '../_components/UserEditor';
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
                    <h2 className="text-2xl font-bold">User not found</h2>
                </div>
            </div>
        );
    }

    return user && (
        <UserEditor
            user={user}
            isOpen={isOpen}
            onClose={handleClose}
        />
    );
}