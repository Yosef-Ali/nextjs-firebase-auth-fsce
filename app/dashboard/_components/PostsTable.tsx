'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, PinIcon } from 'lucide-react';
import { Post } from '@/app/types/post';
import { postsService } from '@/app/services/posts';
import { useAuth } from '@/app/hooks/use-auth';
import { useSearch } from '@/app/context/search-context';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PostsTableProps {
  initialPosts: Post[];
}

function PostsTable({ initialPosts }: PostsTableProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { searchQuery } = useSearch();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (Array.isArray(initialPosts)) {
      setPosts(initialPosts);
    }
  }, [initialPosts]);

  const handleDelete = async (postId: string) => {
    if (!user || isDeleting) return;

    try {
      setIsDeleting(true);
      const success = await postsService.deletePost(postId);
      
      if (success) {
        setPosts(posts.filter(post => post.id !== postId));
        toast({
          title: 'Success',
          description: 'Post deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete post',
          variant: 'destructive',
        });
      }
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

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;

    const query = searchQuery.toLowerCase();
    return posts.filter((post) => {
      const categoryName = typeof post.category === 'string' 
        ? post.category 
        : post.category?.name || '';
      return (
        post.title?.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query)
      );
    });
  }, [posts, searchQuery]);

  if (!Array.isArray(posts)) {
    return <div>Error loading posts</div>;
  }

  if (filteredPosts.length === 0) {
    if (searchQuery) {
      return (
        <div className="py-10 text-center text-muted-foreground">
          No posts found matching "{searchQuery}"
        </div>
      );
    }
    return (
      <div className="py-10 text-center text-muted-foreground">
        No posts found
      </div>
    );
  }

  // Sort posts with sticky posts first, then by date
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.sticky && !b.sticky) return -1;
    if (!a.sticky && b.sticky) return 1;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  return (
    <div className="overflow-hidden">
      <Table className="bg-transparent">
        <TableHeader>
          <TableRow className="bg-transparent hover:bg-transparent">
            <TableHead className="w-[300px]">Title & Excerpt</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPosts.map((post) => (
            <TableRow key={`${post.id}-${post.createdAt}`} className={`bg-transparent hover:bg-muted/50 ${post.sticky ? "bg-muted/50" : ""}`}>
              <TableCell>
                <div>
                  <h3 className="font-semibold">
                    <div className="flex items-center gap-2">
                      {post.sticky && (
                        <PinIcon className="w-4 h-4 text-primary" />
                      )}
                      {post.title}
                    </div>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {post.excerpt || post.content?.slice(0, 100)}...
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {typeof post.category === 'string' 
                    ? post.category 
                    : post.category?.name || 'Uncategorized'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {post.authorEmail?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{post.authorEmail}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(post.updatedAt, 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-8 h-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="w-4 h-4" />
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
                      className="text-red-600"
                      onClick={() => handleDelete(post.id)}
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
