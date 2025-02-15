'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PostEditor } from '@/app/dashboard/_components/posts/PostEditor';
import { useAuth } from '@/app/hooks/use-auth';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewAboutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  let section;

  if (searchParams) {
    section = searchParams.get('section');
  } else {
    console.error('searchParams is null');
    // Handle the case where searchParams is null
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Button
        variant="ghost"
        className="flex items-center"
        onClick={() => router.push('/dashboard/about')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to About Content
      </Button>

      <PostEditor
        initialData={{
          title: `Our ${section?.charAt(0).toUpperCase()}${section?.slice(1)}`,
          content: '',
          section: section || '',
          category: 'about',
          published: true
        }}
        onSuccess={() => router.push('/dashboard/about')}
      />
    </div>
  );
}
