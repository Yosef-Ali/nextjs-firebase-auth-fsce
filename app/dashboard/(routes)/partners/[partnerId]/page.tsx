'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { PartnerForm } from '../_components/partner-form';
import { partnersService } from '@/app/services/partners';
import { Partner } from '@/app/types/partner';
import { toast } from '@/hooks/use-toast';

type PageProps = {
  params: Promise<{
    partnerId: string;
  }>;
};

function PartnerPage({ params }: PageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
      return;
    }

    const loadPartner = async () => {
      if (!user || !resolvedParams?.partnerId) return;
      
      try {
        // Check if user has permission to view this partner
        const canView = await partnersService.canViewPartner(user.uid, resolvedParams.partnerId);
        if (!canView) {
          toast({
            title: 'Error',
            description: 'You do not have permission to view this partner.',
            variant: 'destructive',
          });
          router.push('/partners');  // Redirect to partners page
          return;
        }

        const partnerData = await partnersService.getPartnerById(resolvedParams.partnerId);
        if (!partnerData) {
          toast({
            title: 'Error',
            description: 'Partner not found.',
            variant: 'destructive',
          });
          router.push('/partners');  // Redirect to partners page
          return;
        }

        setPartner(partnerData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading partner:', error);
        toast({
          title: 'Error',
          description: 'Failed to load partner. Please try again.',
          variant: 'destructive',
        });
        router.push('/partners');  // Redirect to partners page
      }
    };

    if (!loading && user) {
      loadPartner();
    }
  }, [resolvedParams?.partnerId, user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !partner) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-9 w-[100px]" /> {/* Back button skeleton */}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-[200px]" /> {/* Title skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" /> {/* Form skeleton */}
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-[100px]" /> {/* Cancel button skeleton */}
              <Skeleton className="h-10 w-[100px]" /> {/* Save button skeleton */}
            </div>
          </div>
        </div>
      </div>
    );
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
        <h1 className="text-3xl font-bold">Partner Details</h1>
        <PartnerForm initialData={{
          ...partner,
          logoUrl: partner?.logo
        }} />
      </div>
    </div>
  );
}

export default PartnerPage;
