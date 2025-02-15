'use client';

import { useEffect, useState } from 'react';
import { withRoleProtection } from '@/app/lib/withRoleProtection';
import { UserRole } from '@/lib/authorization';
import PostsTable from '@/app/dashboard/_components/PostsTable';
import { useAuth } from '@/app/hooks/use-auth';
import { postsService } from '@/app/services/posts';
import { Post } from '@/app/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

function PostsPage() {
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
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Please log in to view posts</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto space-y-8">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Posts Management
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Create, edit, and manage your posts. Organize content and track post status efficiently.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Posts</h3>
          <Button onClick={() => router.push('/dashboard/posts/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </CardHeader>
        <div className="p-0">
          <PostsTable initialPosts={posts} />
        </div>
      </Card>
    </div>
  );
}

// Protect posts management with author role requirement
export default withRoleProtection(PostsPage, UserRole.AUTHOR);
