'use client';

import { useEffect, useState } from 'react';
import PostsTable from '@/app/dashboard/_components/PostsTable';
import { useAuth } from '@/lib/hooks/useAuth';
import { postsService } from '@/app/services/posts';
import { Post } from '@/app/types/post';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function PostsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialPosts = async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const allPosts = await postsService.getUserPosts(user.uid);
      setPosts(Array.isArray(allPosts) ? allPosts : []);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while loading posts';
      console.error('Error loading posts:', error);
      setError(errorMessage);
      toast({
        title: "Error loading posts",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialPosts();
  }, [user?.uid]);

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

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] space-y-4">
        <p className="text-destructive">{error}</p>
        <Button 
          onClick={loadInitialPosts} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
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
      <PostsTable 
        initialPosts={posts} 
        onError={(error) => {
          toast({
            title: "Error",
            description: error,
            variant: "destructive"
          });
        }}
      />
    </div>
  );
}
