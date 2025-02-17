import { Post } from '@/app/types/post';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { Category } from '@/app/types/category';
import { postsService } from '@/app/services/posts';
import PostFormFields from './PostFormFields';

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

    const onSubmit = async (data: PostFormData) => {
        if (!user) return;

        try {
            setIsSaving(true);
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
                const success = await postsService.updatePost(post.id, postData, user.uid);
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
                <PostFormFields
                    form={form}
                    categories={categories}
                    isSaving={isSaving}
                    onCancel={() => router.back()}
                    isEditing={!!post}
                />
            </form>
        </Form>
    );
}