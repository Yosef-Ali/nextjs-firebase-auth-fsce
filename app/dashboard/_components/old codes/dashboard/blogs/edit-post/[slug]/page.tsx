"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { PostFormLayout } from '@/components/dashboard/post-form-layout';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { usePostFormStore } from '@/lib/store';
import { PostStatus } from '@/types/post';

export default function EditPost({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const initialized = useRef(false);
  const { initializeForm } = usePostFormStore();
  const existingPost = useQuery(api.posts.getPostBySlug, { slug: params.slug });

  useEffect(() => {
    if (existingPost && !initialized.current) {
      initialized.current = true;
      initializeForm(
        existingPost.status as PostStatus,
        existingPost.category || undefined
      );
    }
    return () => initializeForm("draft", undefined); // Reset on unmount
  }, [existingPost]);

  const formattedPost = existingPost ? {
    title: existingPost.title,
    content: typeof existingPost.content === 'string'
      ? existingPost.content
      : JSON.stringify(existingPost.content),
    slug: existingPost.slug,
    excerpt: existingPost.excerpt,
    category: existingPost.category,
    images: existingPost.images || [],
    _id: existingPost._id,
  } : undefined;

  if (!formattedPost) {
    return <div>Loading...</div>;
  }

  return (
    <PostFormLayout
      title={`Edit Post: ${params.slug}`}
      mode="edit"
      post={formattedPost}
      onBack={() => router.back()}
      initialImages={formattedPost.images}
    />
  );
}

