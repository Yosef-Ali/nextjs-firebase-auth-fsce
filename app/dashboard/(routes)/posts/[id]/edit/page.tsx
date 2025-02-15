'use client';

import { useParams } from 'next/navigation';
import { withRoleProtection } from '@/app/lib/withRoleProtection';
import { UserRole } from '@/app/types/user';
import { useAuthContext } from '@/lib/context/auth-context';
import { PostEditor } from '@/app/dashboard/_components/PostEditor';
import { useEffect, useState } from 'react';
import { postsService } from '@/app/services/posts';
import { toast } from '@/hooks/use-toast';
import type { Post } from '@/app/types/post';

function EditPostPage() {
  const { user } = useAuthContext();
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params?.id) return;

      try {
        const fetchedPost = await postsService.getPostById(params.id as string);
        if (fetchedPost) {
          setPost(fetchedPost);
        } else {
          toast({
            title: 'Error',
            description: 'Post not found',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load post',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPost();
    }
  }, [params?.id, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="p-6">
      <PostEditor post={post} />
    </div>
  );
}

export default withRoleProtection(EditPostPage, UserRole.ADMIN);
