'use client';

import { useRouter, useParams } from 'next/navigation';
import { PostEditor } from '@/app/dashboard/_components/posts/PostEditor';
import { useAuth } from '@/app/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { Post } from '@/app/types/post';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { postsService } from '@/app/services/posts';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function EditPostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!user || !id) return;

      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPost({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now()
          } as Post);
        } else {
          toast({
            title: "Error",
            description: "Post not found",
            variant: "destructive"
          });
          router.push('/dashboard/posts');
        }
      } catch (error: unknown) {
        console.error('Error loading post:', error);
        if (error instanceof Error && error.message.includes('Could not reach Cloud Firestore backend')) {
          toast({
            title: "Network Error",
            description: "Could not reach Cloud Firestore backend. Please check your internet connection.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load post",
            variant: "destructive"
          });
        }
        router.push('/dashboard/posts');
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      if (!user) {
        router.push('/sign-in');
        return;
      }
      loadPost();
    }
  }, [loading, user, router, id]);

  if (loading || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
            disabled
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Skeleton className="h-[200px] w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <PostEditor post={post} />
    </div>
  );
}
