'use client';

import { useRouter } from 'next/navigation';
import { ResourceEditor } from '@/app/dashboard/_components/ResourceEditor';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/hooks/useAuth";

export default function NewResourcePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');  // Redirect to home page
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-9 w-[100px]" /> {/* Back button skeleton */}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-[200px]" /> {/* Title skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" /> {/* Title input skeleton */}
            <Skeleton className="h-32 w-full" /> {/* Description input skeleton */}
            <div className="flex gap-4">
              <Skeleton className="h-10 w-[120px]" /> {/* Type select skeleton */}
              <Skeleton className="h-10 w-[120px]" /> {/* Status select skeleton */}
            </div>
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-[100px]" /> {/* Cancel button skeleton */}
              <Skeleton className="h-10 w-[100px]" /> {/* Save button skeleton */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Resource</h1>
        <ResourceEditor mode="create" />
      </div>
    </div>
  );
}
