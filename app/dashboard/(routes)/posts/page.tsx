'use client';


import { PostsTable } from '@/app/dashboard/_components/PostsTable';

export default function PostsPage() {
  return (
    <div className="container mx-auto py-10">
      <PostsTable initialPosts={[]} />
    </div>
  );
}
