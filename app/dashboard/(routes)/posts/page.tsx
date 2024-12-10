'use client';

import { useEffect, useState } from 'react';
import PostsTable from '@/app/dashboard/_components/PostsTable';
import { useAuth } from '@/lib/hooks/useAuth';
import { postsService } from '@/app/services/posts';
import { Post } from '@/app/types/post';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PostsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialPosts = async () => {
      if (!user) return;
      
      try {
        const allPosts = await postsService.getUserPosts(user.uid);
        setPosts(allPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialPosts();
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-muted-foreground">Please log in to view posts</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-muted-foreground">Loading posts...</p>
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
