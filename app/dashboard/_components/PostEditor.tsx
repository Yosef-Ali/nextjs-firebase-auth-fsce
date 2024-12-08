'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ImageUploadCard  from './ImageUploadCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SelectOption } from '@/components/ui/select';

import { useAuth } from '@/app/hooks/useAuth';
import { Post } from '@/app/types/post';
import { postsService } from '@/app/services/posts';
import { toast } from '@/hooks/use-toast';
import { categoriesService } from '@/app/services/categories';
import { Category } from '@/app/types/category';

import { Editor } from '@/components/editor';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  coverImage: z.string().refine((val) => val === '' || val.startsWith('http'), {
    message: 'Cover image must be a valid URL or empty',
  }).optional().default(''),
  images: z.array(z.string().url()).optional(),
  published: z.boolean().default(false),
  category: z.string().min(1, 'Category is required'),
  section: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
});

type PostFormData = z.infer<typeof formSchema>;

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
  const router = useRouter();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<string[]>(post?.images || []);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<PostFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || initialData?.title || '',
      content: post?.content || initialData?.content || '',
      excerpt: post?.excerpt || '',
      coverImage: post?.coverImage || '',
      images: post?.images || [],
      published: post?.published || initialData?.published || false,
      category: post?.category || initialData?.category || '',
      section: post?.section || initialData?.section || '',
      slug: post?.slug || '',
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoriesService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  React.useEffect(() => {
    const title = form.getValues('title');
    const content = form.getValues('content');
    
    if (title) {
      const generatedSlug = postsService.createSlug(title);
      form.setValue('slug', generatedSlug, { shouldValidate: true });
      
      // Improved excerpt generation
      const currentExcerpt = form.getValues('excerpt');
      
      // Generate excerpt from content, stripping HTML if present
      const stripHtml = (html: string) => {
        return html.replace(/<[^>]*>?/gm, '').trim();
      };

      const cleanContent = content ? stripHtml(content) : '';
      
      const generatedExcerpt = cleanContent 
        ? (cleanContent.length > 160 
          ? cleanContent.substring(0, 160) + '...' 
          : cleanContent)
        : (title.length > 160 
          ? title.substring(0, 160) + '...' 
          : title);
      
      // Only set excerpt if it's currently empty
      if (!currentExcerpt) {
        console.log('Generating excerpt:', generatedExcerpt);
        form.setValue('excerpt', generatedExcerpt, { shouldValidate: true });
      }
    }
  }, [form.watch('title'), form.watch('content')]);

  const onSubmit = async (data: PostFormData) => {
    if (!user) return;

    try {
      setIsSaving(true);
      const currentUser = user;
      if (!currentUser?.email) {
        throw new Error("User must be logged in to create/edit posts");
      }

      const postData = {
        title: form.getValues('title'),
        content: form.getValues('content'),
        excerpt: form.getValues('excerpt'),
        category: form.getValues('category'),
        coverImage: form.getValues('coverImage'),
        published: form.getValues('published'),
        section: form.getValues('section'),
        images: form.getValues('images'),
        authorId: currentUser.uid,
        authorEmail: currentUser.email,
        slug: postsService.createSlug(form.getValues('title')),
        date: new Date().toISOString(),
        tags: [],
        featured: false,
      };

      if (post) {
        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to update posts",
            variant: "destructive",
          });
          return;
        }

        const updateResult = await postsService.updatePost(post.id, postData, user.uid);
        if (updateResult) {
          toast({
            title: "Success",
            description: "Post updated successfully",
          });
        } else {
          toast({
            title: "Error",
            description: "You are not authorized to edit this post",
            variant: "destructive",
          });
          return;
        }
      } else {
        const newPost = await postsService.createPost(postData);
        toast({
          title: "Success",
          description: "Post created successfully",
        });
        // Navigate to the edit page of the new post
        router.push(`/dashboard/posts/${newPost.id}/edit`);
      }
      
      // router.push('/dashboard/posts');
      // router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setImages(prev => [...prev, url]);
    form.setValue('images', [...images, url]);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr] gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('category') === 'about' && (
                <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a section" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vision">Vision</SelectItem>
                            <SelectItem value="mission">Mission</SelectItem>
                            <SelectItem value="goals">Goals</SelectItem>
                            <SelectItem value="governance">Governance</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Select which section this content belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                      <div className="min-h-[400px] overflow-y-auto">
                        <Editor {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a brief excerpt..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="Post slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <FormLabel className="block mb-2">Cover Image</FormLabel>
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUploadCard 
                          type="cover"
                          aspectRatio="aspect-[16/9]"
                          onImageUpload={field.onChange}
                          initialImage={post?.coverImage}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="block mb-2">Additional Images</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, index) => (
                    <ImageUploadCard
                      key={index}
                      type="additional"
                      aspectRatio="aspect-square"
                      onImageUpload={(url) => {
                        const currentImages = form.getValues('images') || [];
                        const newImages = [...currentImages];
                        newImages[index] = url;
                        form.setValue('images', newImages.filter(Boolean));
                      }}
                      initialImage={post?.images?.[index]}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Published</FormLabel>
                      <FormDescription>
                        Make this post visible to the public
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/posts')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}