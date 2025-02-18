'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { Post } from '@/app/types/post';
import { formatDate } from '@/app/utils/date';
import { getPosts } from '@/app/actions/posts';
import { Timestamp } from 'firebase/firestore';

export default function PostsTable() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Sort by createdAt timestamp (numeric value)
  const sortedPosts = [...posts].sort((a, b) => compareTimestamps(a.createdAt, b.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex gap-2">
          {/* Add filters here if needed */}
        </div>
        <Link href="/dashboard/posts/new">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No posts found. Create your first post to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.published ? 'Published' : 'Draft'}</TableCell>
                  <TableCell>{formatDate(post.createdAt)}</TableCell>
                  <TableCell>{formatDate(post.updatedAt)}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
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

function compareTimestamps(a: Timestamp, b: Timestamp): number {
  return b.seconds - a.seconds;
}

