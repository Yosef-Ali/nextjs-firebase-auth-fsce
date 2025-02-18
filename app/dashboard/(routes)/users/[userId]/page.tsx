import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UserPageClient from './client';
import { usersService } from '@/app/services/users';

type PageParams = {
    userId: string;
};

interface Props {
    params: Promise<PageParams>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    try {
        const user = await usersService.getUser(resolvedParams.userId);
        return {
            title: user ? `Edit User - ${user.displayName || user.email}` : 'User Not Found',
            description: `Edit user profile and permissions`,
        };
    } catch (error) {
        return {
            title: 'User Not Found',
            description: 'The requested user could not be found',
        };
    }
}

export default async function UsersPage({ params }: Props): Promise<JSX.Element> {
    const resolvedParams = await params;
    try {
        const initialUser = await usersService.getUser(resolvedParams.userId);

        if (!initialUser) {
            notFound();
        }

        return (
            <UserPageClient
                initialUser={initialUser}
                userId={resolvedParams.userId}
            />
        );
    } catch (error) {
        console.error('Error loading user:', error);
        notFound();
    }
}