'use client';

import { useState } from 'react';
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

import { useAuth } from '@/app/hooks/useAuth';
import { Post } from '@/app/types/post';
import { postsService } from '@/app/services/posts';
import { toast } from '@/hooks/use-toast';
import '@/app/components/editor/styles.css';
import { Editor } from '@/app/components/editor';

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
});

type PostFormData = z.infer<typeof formSchema>;

interface PostEditorProps {
  post?: Post;
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<string[]>(post?.images || []);

  const form = useForm<PostFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      coverImage: post?.coverImage || '',
      images: post?.images || [],
      published: post?.published || false,
      category: post?.category || '',
    },
  });

  const onSubmit = async (data: PostFormData) => {
    if (!user) return;

    try {
      setIsSaving(true);
      const postData = {
        ...data,
        authorId: user.uid,
        authorEmail: user.email || '',
        slug: post?.slug || postsService.createSlug(data.title),
        updatedAt: Date.now(),
      };

      if (post) {
        await postsService.updatePost(post.id, postData);
        toast({
          title: "Success",
          description: "Post updated successfully",
        });
      } else {
        await postsService.createPost(postData);
        toast({
          title: "Success",
          description: "Post created successfully",
        });
      }
      
      router.push('/dashboard/posts');
      router.refresh();
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="values-principles">Values & Principles</SelectItem>
                        <SelectItem value="partners">Partners</SelectItem>
                        <SelectItem value="merits">Merits & Achievements</SelectItem>
                        <SelectItem value="prevention-promotion">Prevention & Promotion</SelectItem>
                        <SelectItem value="protection">Protection</SelectItem>
                        <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                        <SelectItem value="resource-center">Resource Center</SelectItem>
                        <SelectItem value="case-stories">Case Stories</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose a category that best fits your post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs defaultValue="write" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <div className="min-h-[400px] max-h-[600px] overflow-y-auto border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                            <Editor {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <div className="min-h-[400px] max-h-[600px] overflow-y-auto border rounded-md">
                    <div className="prose prose-sm w-full max-w-none p-6">
                      <div dangerouslySetInnerHTML={{ __html: form.getValues('content') }} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

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