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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import { Post } from '@/app/types/post';
import { postsService } from '@/app/services/posts';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PostsTableProps {
  initialPosts: Post[];
}

function PostsTable({ initialPosts }: PostsTableProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    console.log('PostsTable received initialPosts:', initialPosts);
    if (Array.isArray(initialPosts)) {
      setPosts(initialPosts);
    }
  }, [initialPosts]);

  const handleDelete = async (postId: string) => {
    if (!user || isDeleting) return;

    try {
      setIsDeleting(true);
      await postsService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!Array.isArray(posts)) {
    return <div>Error loading posts</div>;
  }

  if (posts.length === 0) {
    return <div>No posts found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Title & Excerpt</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <div>
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {post.excerpt || post.content?.slice(0, 100)}...
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{post.category}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {post.author?.name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{post.author?.name || user?.email}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(post.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      aria-label={`Actions for ${post.title}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => router.push(`/dashboard/posts/${post.id}/edit`)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(post.id)}
                      disabled={isDeleting}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default PostsTable;
