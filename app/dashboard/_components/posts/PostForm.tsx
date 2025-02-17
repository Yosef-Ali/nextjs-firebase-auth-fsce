import { Post } from '@/app/types/post';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from 'react';
import { Category } from '@/app/types/category';
import { postsService } from '@/app/services/posts';
import PostFormFields from './PostFormFields';
import { Button } from '@/components/ui/button';

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

export type PostFormData = z.infer<typeof formSchema>;

interface PostFormProps {
    post?: Post;
    initialData?: {
        title: string;
        content: string;
        section?: string;
        category: string;
        published: boolean;
    };
    categories: Category[];
    onSuccess?: () => void;
}

export function PostForm({ post, initialData, categories, onSuccess }: PostFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [titleValue, setTitleValue] = useState(post?.title || initialData?.title || '');

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
            categoryId: typeof post?.category === 'string' ? post.category : post?.category?.id || initialData?.category || '',
            section: post?.section || initialData?.section || '',
            slug: post?.slug || '',
        },
    });

    // Handle title changes separately
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitleValue(newTitle);
        form.setValue('title', newTitle);
        
        // Update form values
        if (!post?.slug) {
            const timer = setTimeout(() => {
                const generatedSlug = postsService.createSlug(newTitle);
                form.setValue('slug', generatedSlug, { 
                    shouldValidate: true,
                    shouldDirty: true,
                });
            }, 500);
            return () => clearTimeout(timer);
        }
    };

    // Watch content for excerpt generation
    const content = form.watch('content');

    // Auto-generate excerpt when content changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content) {
                const plainText = content.replace(/<[^>]*>/g, '');
                const excerpt = plainText.slice(0, 150) + (plainText.length > 150 ? '...' : '');
                form.setValue('excerpt', excerpt, { shouldValidate: true });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [content, form]);

    const onSubmit = async (data: PostFormData) => {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to create a post",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSaving(true);
            const selectedCategory = categories.find(cat => cat.id === data.categoryId);

            if (!selectedCategory) {
                toast({
                    title: "Error",
                    description: "Please select a valid category",
                    variant: "destructive",
                });
                return;
            }

            const postData = {
                title: data.title,
                content: data.content,
                excerpt: data.excerpt,
                category: selectedCategory,
                coverImage: data.coverImage || '',
                published: data.published,
                sticky: data.sticky,
                section: data.section,
                images: data.images || [],
                authorId: user.uid,
                authorEmail: user.email || '',
                slug: data.slug,
                date: Date.now(),
                tags: [],
                featured: false,
            };

            if (post?.id) {
                await postsService.updatePost(post.id, postData, user.uid);
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

            onSuccess?.();
            router.push('/dashboard/posts');
        } catch (error) {
            console.error('Error saving post:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An error occurred while saving the post",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-8"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <PostFormFields 
                    form={form} 
                    categories={categories}
                    onTitleChange={handleTitleChange}
                    titleValue={titleValue}
                />
                <div className="flex justify-end gap-4">
                    <Button 
                        type="submit" 
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
