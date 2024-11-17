'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Post } from '@/app/types/post';
import { postsService } from '@/app/services/posts';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PostsTableProps {
  initialPosts: Post[];
}

export function PostsTable({ initialPosts }: PostsTableProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      if (!user) return;
      try {
        const userPosts = await postsService.getUserPosts(user.uid);
        setPosts(userPosts);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load posts. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [user]);

  const handleDelete = async (postId: string) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await postsService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: 'Post deleted',
        description: 'The post has been deleted successfully.',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
        <Button onClick={() => router.push('/dashboard/posts/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading posts...
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No posts found. Create your first post!
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={post.published ? 'default' : 'secondary'}>
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/posts/${post.id}/edit`)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/posts/${post.slug}`)}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(post.id)}
                          disabled={isDeleting}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
