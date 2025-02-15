'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { withRoleProtection } from '@/app/lib/withRoleProtection';
import { UserRole } from '@/app/types/user';
import { toast } from '@/hooks/use-toast';
import { ResourceEditor } from '@/app/dashboard/_components/ResourceEditor';
import { Resource } from '@/app/types/resource';
import { getResourceById } from '@/app/actions/resources-actions';
import { useAuthContext } from '@/lib/context/auth-context';

function ResourcePage() {
    const { user } = useAuthContext();
    const params = useParams();
    const [resource, setResource] = useState<Resource | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResource = async () => {
            try {
                if (!params?.resourceId) {
                    toast({
                        title: 'Error',
                        description: 'Resource ID is required',
                        variant: 'destructive',
                    });
                    return;
                }

                const result = await getResourceById(params.resourceId as string);
                if (result.success && result.data) {
                    setResource(result.data);
                } else {
                    toast({
                        title: 'Error',
                        description: result.error || 'Failed to fetch resource',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to fetch resource',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchResource();
        }
    }, [params?.resourceId, user]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!resource) {
        return <div>Resource not found</div>;
    }

    return (
        <div className="p-6">
            <ResourceEditor resource={resource} mode="edit" />
        </div>
    );
}

export default withRoleProtection(ResourcePage, UserRole.ADMIN);