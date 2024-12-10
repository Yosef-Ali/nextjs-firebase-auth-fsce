'use client';

import { useRouter } from 'next/navigation';
import { PostEditor } from '@/app/dashboard/_components/PostEditor';
import { useAuth } from '@/app/providers/AuthProvider';
import { useEffect, useState, use } from 'react';
import { Post } from '@/app/types/post';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { postsService } from '@/app/services/posts';
import { usersService } from '@/app/services/users';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditPostPage({ params }: PageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
      return;
    }

    const loadPost = async () => {
      if (!user || !resolvedParams?.id) return;
      
      try {
        // Check if user has permission to edit this post
        const canEdit = await postsService.canEditPost(user.uid, resolvedParams.id);
        if (!canEdit) {
          toast({
            title: 'Error',
            description: 'You do not have permission to edit this post.',
            variant: 'destructive',
          });
          router.push('/');  // Redirect to home page
          return;
        }

        const postDoc = await getDoc(doc(db, 'posts', resolvedParams.id));
        if (!postDoc.exists()) {
          toast({
            title: 'Error',
            description: 'Post not found.',
            variant: 'destructive',
          });
          router.push('/');  // Redirect to home page
          return;
        }

        const data = postDoc.data();
        const postData: Post = {
          id: postDoc.id,
          ...data,
          date: data.date ? new Date(data.date).toISOString() : new Date(data.createdAt?.toMillis() || Date.now()).toISOString(),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          category: data.category || '',
          published: data.published || false,
          authorId: data.authorId || user.uid, // Set current user as author if not set
          authorEmail: data.authorEmail || user.email || '',
          slug: data.slug || '',
          coverImage: data.coverImage || '',
          images: data.images || [],
          tags: data.tags || [],
        };

        setPost(postData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load post. Please try again.',
          variant: 'destructive',
        });
        router.push('/');  // Redirect to home page
      }
    };

    if (!loading && user) {
      loadPost();
    }
  }, [resolvedParams?.id, user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !post) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-9 w-[100px]" /> {/* Back button skeleton */}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-[200px]" /> {/* Title skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" /> {/* Title input skeleton */}
            <Skeleton className="h-32 w-full" /> {/* Content editor skeleton */}
            <div className="flex gap-4">
              <Skeleton className="h-10 w-[120px]" /> {/* Category select skeleton */}
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
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <PostEditor post={post} />
      </div>
    </div>
  );
}
