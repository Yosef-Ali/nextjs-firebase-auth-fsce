'use client';

import { useEffect, useState } from 'react';
import PostsTable from '@/app/dashboard/_components/PostsTable';
import { useAuth } from '@/lib/hooks/useAuth';
import { postsService } from '@/app/services/posts';
import { Post } from '@/app/types/post';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function PostsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const fetchedPosts = await postsService.getUserPosts(user.uid);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
        setError('Failed to load posts. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadPosts();
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Button onClick={() => router.push('/dashboard/posts/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>
      <PostsTable initialPosts={posts} />
    </div>
  );
}
