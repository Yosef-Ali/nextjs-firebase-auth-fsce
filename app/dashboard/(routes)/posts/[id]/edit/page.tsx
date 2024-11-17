'use client';

import { useRouter } from 'next/navigation';
import { PostEditor } from '@/app/dashboard/_components/PostEditor';
import { useAuth } from '@/app/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Post } from '@/app/types/post';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { toast } from '@/hooks/use-toast';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
      return;
    }

    const loadPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', params.id));
        if (!postDoc.exists()) {
          toast({
            title: 'Error',
            description: 'Post not found.',
            variant: 'destructive',
          });
          router.push('/dashboard/posts');
          return;
        }

        const postData = postDoc.data() as Post;
        if (postData.authorId !== user?.uid) {
          toast({
            title: 'Error',
            description: 'You do not have permission to edit this post.',
            variant: 'destructive',
          });
          router.push('/dashboard/posts');
          return;
        }

        setPost({ ...postData, id: postDoc.id });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load post. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadPost();
    }
  }, [loading, user, router, params.id]);

  if (loading || isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user || !post) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <PostEditor post={post} />
    </div>
  );
}
