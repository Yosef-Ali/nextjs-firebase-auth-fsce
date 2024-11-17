"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PostFormLayout } from '@/components/dashboard/post-form-layout';
import { usePostFormStore } from '@/lib/store';

export default function AddPost() {
  const router = useRouter();
  const { initializeForm } = usePostFormStore();

  useEffect(() => {
    // Initialize form only once when component mounts
    initializeForm("draft", undefined); // Use undefined instead of null
    return () => initializeForm("draft", undefined); // Reset on unmount
  }, []);

  return (
    <PostFormLayout
      title="Add New Post"
      mode="add"
      onBack={() => router.back()}
    />
  );
}