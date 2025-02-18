'use client';

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { categoryService } from '@/app/services/categories';
import { Category } from '@/app/types/category';
import { Post } from '@/app/types/post';
import { PostForm } from './PostForm';

interface PostEditorProps {
  post?: Post;
  initialData?: {
    title: string;
    content: string;
    section?: string;
    category: string;
    published: boolean;
  };
  onSuccess?: () => void;
}

export function PostEditor({ post, initialData, onSuccess }: PostEditorProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoryService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchCategories();
  }, [toast]);

  return (
    <PostForm
      post={post}
      initialData={initialData}
      categories={categories}
      onSuccess={onSuccess}
    />
  );
}
