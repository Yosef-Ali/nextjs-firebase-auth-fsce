'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { cn } from '@/lib/utils';
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
import ImageUploadCard from './ImageUploadCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import MediaGrid from '@/app/dashboard/_components/MediaGrid';
import { mediaService } from '@/app/services/media';
import { Media } from '@/app/types/media';

import { useAuth } from '@/lib/hooks/useAuth';
import { Post } from '@/app/types/post';
import { postsService } from '@/app/services/posts';
import { categoriesService } from '@/app/services/categories';
import { Category } from '@/app/types/category';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Editor } from '@/components/editor';
import { useToast } from "@/hooks/use-toast"
import { Timestamp } from 'firebase/firestore';
import { ImageSelector } from "@/components/image-selector";

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  coverImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  published: z.boolean().default(false),
  sticky: z.boolean().default(false),
  categoryId: z.string().min(1, 'Category is required'),
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
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState<Media[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [images, setImages] = useState<string[]>(post?.images || []);
  const [categories, setCategories] = useState<Category[]>([]);
  const storage = getStorage();
  const [loadingGalleryStart, setLoadingGalleryStart] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || initialData?.title || '',
      content: post?.content || initialData?.content || '',
      excerpt: post?.excerpt || '',
      coverImage: post?.coverImage || '',
      images: post?.images || [],
      published: post?.published || initialData?.published || false,
      sticky: post?.sticky || false,
      categoryId: post?.category?.id || initialData?.category || '',
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
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchCategories();
  }, [toast]);

  useEffect(() => {
    const title = form.getValues('title');
    const content = form.getValues('content');

    if (title) {
      const generatedSlug = postsService.createSlug(title);
      form.setValue('slug', generatedSlug, { shouldValidate: true });

      const currentExcerpt = form.getValues('excerpt');

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

      if (!currentExcerpt) {
        form.setValue('excerpt', generatedExcerpt, { shouldValidate: true });
      }
    }
  }, [form.watch('title'), form.watch('content')]);

  const uploadImageToFirebase = async (file: File) => {
    if (!user) throw new Error('You must be logged in to upload images.');

    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit.');
    }

    try {
      const result = await mediaService.uploadMedia(file, {
        name: file.name,
        description: '',
        type: 'image',
        tags: [],
        alt: '',
        caption: '',
        uploadedBy: user.uid,
        uploadedByEmail: user.email || '',
      });

      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  const loadMedia = async () => {
    try {
      setIsLoadingMedia(true);
      const result = await mediaService.getMedia();

      if (!result.items || result.items.length === 0) {
        toast({
          title: "No Images",
          description: "No images found in the gallery",
        });
        return;
      }

      const validImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const filteredMedia = result.items
        .filter(item => {
          if (item.type !== 'image') return false;
          const extension = item.url.split('.').pop()?.toLowerCase();
          return extension && validImageTypes.includes(extension);
        })
        .map(item => ({
          ...item,
          createdAt: item.createdAt instanceof Timestamp
            ? item.createdAt.toDate()
            : new Date(item.createdAt),
          updatedAt: item.updatedAt instanceof Timestamp
            ? item.updatedAt.toDate()
            : new Date(item.updatedAt)
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      console.log('Filtered media items:', filteredMedia.length);
      setGalleryMedia(filteredMedia);
    } catch (error) {
      console.error('Error loading media:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load media",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleGallerySelect = (id: string, selected: boolean) => {
    const media = galleryMedia.find(m => m.id === id);
    if (!media) return;

    const currentImages = form.getValues('images') || [];
    const newImages = selected
      ? currentImages.includes(media.url)
        ? currentImages // Don't add if already exists
        : [...currentImages, media.url]
      : currentImages.filter(url => url !== media.url);

    form.setValue('images', newImages, { shouldValidate: true });

    // Only show toast for actual changes
    if (selected && !currentImages.includes(media.url)) {
      toast({
        title: "Image Added",
        description: "Image has been added to your post",
      });
    } else if (!selected && currentImages.includes(media.url)) {
      toast({
        title: "Image Removed",
        description: "Image has been removed from your post",
      });
    }
  };

  const openGallery = async () => {
    try {
      setLoadingGalleryStart(true);
      setIsGalleryOpen(true);
      await loadMedia();
    } catch (error) {
      console.error('Error loading gallery:', error);
      toast({
        title: "Error",
        description: "Failed to load media gallery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingGalleryStart(false);
    }
  };

  const onSubmit = async (data: PostFormData) => {
    if (!user) return;

    try {
      setIsSaving(true);
      const currentUser = user;

      const coverImageUrl = data.coverImage;
      const selectedCategory = categories.find(cat => cat.id === data.categoryId);

      if (!selectedCategory) {
        toast({
          title: "Error",
          description: "Please select a valid category.",
          variant: "destructive",
        });
        return;
      }

      const postData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: selectedCategory.id,
        coverImage: coverImageUrl || '',
        published: data.published,
        sticky: data.sticky,
        section: data.section,
        images: data.images || [],
        authorId: currentUser.uid,
        authorEmail: currentUser.email || '',
        slug: data.slug,
        date: new Date().toISOString(),
        tags: [],
        featured: false,
      };

      if (post?.id) {
        const success = await postsService.updatePost(post.id, postData, currentUser.uid);
        if (success) {
          toast({
            title: "Success",
            description: "Post updated successfully",
          });
          router.push('/dashboard/posts');
        } else {
          toast({
            title: "Error",
            description: "Failed to update post",
            variant: "destructive",
          });
        }
      } else {
        const newPost = await postsService.createPost(postData);
        if (newPost) {
          toast({
            title: "Success",
            description: "Post created successfully",
          });
          router.push('/dashboard/posts');
        } else {
          toast({
            title: "Error",
            description: "Failed to create post",
            variant: "destructive",
          });
        }
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the post",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Editor
                  value={field.value}
                  onChange={field.onChange}
                />
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
                  placeholder="Brief description of the post"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormDescription>
                Select a cover image for your post
              </FormDescription>
              <FormControl>
                <ImageSelector
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Published
                  </FormLabel>
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

          <FormField
            control={form.control}
            name="sticky"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Sticky Post
                  </FormLabel>
                  <FormDescription>
                    Pin this post to appear at the top of listings
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!form.getValues('published')}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {field.value?.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Uploaded image ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = [...(field.value || [])];
                            newImages.splice(index, 1);
                            field.onChange(newImages);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-primary cursor-pointer transition-colors"
                        onClick={() => {
                          document.getElementById('image-upload')?.click();
                        }}
                      >
                        <div className="text-center">
                          <svg
                            className="w-8 h-8 text-gray-400 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span className="mt-2 text-sm text-gray-500 block">Upload Images</span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center transition-colors",
                          !loadingGalleryStart && "hover:border-primary cursor-pointer",
                          loadingGalleryStart && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => {
                          if (!loadingGalleryStart) {
                            openGallery();
                          }
                        }}
                      >
                        <div className="text-center">
                          {loadingGalleryStart ? (
                            <>
                              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                              <span className="mt-2 text-sm text-gray-500 block">Loading...</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-8 h-8 text-gray-400 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="mt-2 text-sm text-gray-500 block">Select from Gallery</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      try {
                        const files = Array.from(e.target.files || []);
                        const uploadPromises = files.map(uploadImageToFirebase);
                        const urls = await Promise.all(uploadPromises);
                        field.onChange([...field.value || [], ...urls]);
                      } catch (error) {
                        console.error('Error uploading images:', error);
                        toast({
                          title: "Error",
                          description: error instanceof Error ? error.message : "Failed to upload images",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Upload multiple images for your post or select from the media gallery. Each image should be less than 5MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gallery Dialog */}
        <Dialog
          open={isGalleryOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsGalleryOpen(false);
              setGalleryMedia([]);
            }
          }}
        >
          <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Images from Gallery</DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0 py-4">
              {isLoadingMedia ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading media gallery...</p>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto pr-4 -mr-4">
                  <MediaGrid
                    items={galleryMedia}
                    selectable
                    selectedItems={galleryMedia
                      .filter(media => (form.getValues('images') || []).includes(media.url))
                      .map(media => media.id)}
                    onSelect={handleGallerySelect}
                  />
                </div>
              )}
            </div>
            <DialogFooter className="border-t pt-4">
              <Button type="button" onClick={() => setIsGalleryOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : (post ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
