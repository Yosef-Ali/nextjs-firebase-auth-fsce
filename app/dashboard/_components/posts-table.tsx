import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditIcon, Trash2Icon } from "lucide-react";
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Post } from '@/app/types/post';
import { getCategoryName } from '@/app/utils/category';
import { toDate } from '@/app/utils/date';

interface PostTableProps {
  posts: Post[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Helper function to safely compare timestamps
function compareTimestamps(a: any, b: any) {
  // Handle different timestamp formats safely
  const getTime = (timestamp: any) => {
    if (!timestamp) return 0;
    if (typeof timestamp === 'number') return timestamp;
    if (timestamp.seconds) return timestamp.seconds * 1000;
    if (timestamp instanceof Date) return timestamp.getTime();
    return 0;
  };

  return getTime(b) - getTime(a);
}

function sortByDate(a: Post, b: Post) {
  return compareTimestamps(a.updatedAt, b.updatedAt);
}

export default function PostTable({ posts, isLoading, onEdit, onDelete }: PostTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No posts found
      </div>
    );
  }

  // Calculate stats
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(post => post.status === 'published').length;
  const draftPosts = totalPosts - publishedPosts;
  const categories = Array.from(new Set(posts.map(post => getCategoryName(post.category))));

  // Sort posts by updatedAt in descending order (newest first)
  const sortedPosts = [...posts].sort(sortByDate);

  // Helper to safely format a date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      if (timestamp instanceof Date) return format(timestamp, 'MMM d, yyyy');
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), 'MMM d, yyyy');
      }
      if (timestamp.seconds) {
        return format(new Date(timestamp.seconds * 1000), 'MMM d, yyyy');
      }
      return '';
    } catch (e) {
      console.error("Error formatting date:", e);
      return '';
    }
  };

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
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {getCategoryName(post.category)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${post.status === 'published' ? 'bg-green-100 text-green-800' :
                    post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}>
                  {post.status}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(post.updatedAt)}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(post.id)}
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
