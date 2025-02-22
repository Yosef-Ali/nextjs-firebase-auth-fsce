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
import { useAuth } from '@/lib/hooks/useAuth';
import { useSearch } from '@/app/context/search-context';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { getCategoryName } from '@/app/utils/category';

interface PostsTableProps {
  initialPosts: Post[];
}

export default function PostsTable({ initialPosts }: PostsTableProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { searchQuery } = useSearch();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    if (Array.isArray(initialPosts)) {
      setPosts(initialPosts);
      setLoadingState('idle');
    }
  }, [initialPosts]);

  const handleDelete = async (postId: string) => {
    if (!user || isDeleting) return;

    try {
      setIsDeleting(true);
      const success = await postsService.deletePost(user.uid, postId);

      if (success) {
        setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
        toast({
          title: 'Success',
          description: 'Post deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'You are not authorized to delete this post',
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

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;

    const query = searchQuery.toLowerCase();
    return posts.filter((post) => {
      const categoryName = getCategoryName(post.category)?.toLowerCase() || '';
      return (
        post.title?.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        categoryName.includes(query)
      );
    });
  }, [posts, searchQuery]);

  if (loadingState === 'loading') {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load posts. Please try again.
      </div>
    );
  }

  if (!Array.isArray(posts)) {
    return <div className="text-center py-8 text-destructive">Invalid posts data</div>;
  }

  if (filteredPosts.length === 0) {
    if (searchQuery) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No posts found matching "{searchQuery}"
        </div>
      );
    }
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts found. Create your first post!
      </div>
    );
  }

  // Calculate stats
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(post => post.published).length;
  const draftPosts = totalPosts - publishedPosts;
  const uniqueCategories = Array.from(new Set(posts.map(post => getCategoryName(post.category))));

  // Sort posts with sticky posts first, then by date
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.sticky && !b.sticky) return -1;
    if (!a.sticky && b.sticky) return 1;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">Total Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{publishedPosts}</div>
            <p className="text-xs text-muted-foreground">Published Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{draftPosts}</div>
            <p className="text-xs text-muted-foreground">Draft Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{uniqueCategories.length}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title & Excerpt</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPosts.map((post) => (
              <TableRow key={`${post.id}-${post.createdAt}`} className={post.sticky ? "bg-muted/50" : ""}>
                <TableCell>
                  <div>
                    <h3 className="font-semibold">
                      <div className="flex items-center gap-2">
                        {post.sticky && (
                          <PinIcon className="h-4 w-4 text-primary" />
                        )}
                        {post.title}
                      </div>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {post.excerpt || post.content?.slice(0, 100)}...
                    </p>
                  </div>
                </TableCell>
                {post.category && (
                  <TableCell>
                    <Badge variant="secondary">
                      {getCategoryName(post.category)}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {post.authorEmail?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{post.authorEmail}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(post.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
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
                        className="text-red-600"
                        onClick={() => handleDelete(post.id)}
                        disabled={isDeleting}
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
    </div>
  );
}
