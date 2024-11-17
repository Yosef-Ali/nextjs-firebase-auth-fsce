"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JSONContent } from '@tiptap/core';
import { useRouter } from 'next/navigation';
import { usePostFormStore } from "@/lib/store";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import NovelEditor, { EditorContent } from "./novel-text-editor";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import PostCategorySelector from "./form/post-category-selector";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }),
  content: z.string().min(2, {
    message: "Content must be at least 2 characters.",
  }),
  excerpt: z.string().min(2, {
    message: "Excerpt must be at least 2 characters.",
  }),
  images: z.array(z.string()).optional(),  // Keep as images array
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface PostDetailsFormProps {
  post?: FormData & { _id: Id<"posts"> };
  postStatus?: "draft" | "published" | "archived"; // Make postStatus optional
  mode: "add" | "edit";
}

const cleanSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-') // replace spaces with dashes
    .replace(/['’]+/g, '') // remove apostrophes
    .replace(/[,]+/g, '') // remove commas
    .replace(/[^a-z0-9-]+/g, ''); // remove any other non-alphanumeric characters except for dashes
};

export const PostDetailsForm: React.FC<PostDetailsFormProps> = ({
  post,
  mode,
}) => {
  const [content, setContent] = useState<JSONContent>(() => {
    if (!post?.content) {
      return { type: 'doc', content: [] };
    }
    try {
      return typeof post.content === 'string'
        ? JSON.parse(post.content)
        : post.content;
    } catch (error) {
      console.error('Invalid content format:', error);
      return { type: 'doc', content: [] };
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addPost = useMutation(api.posts.addPost);
  const updatePost = useMutation(api.posts.updatePost);
  const categories = useQuery(api.categories.list) || [];
  const [resetTrigger, setResetTrigger] = useState(0);
  const novelEditorRef = useRef<{ clearContent: () => void } | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { status: postStatus, category } = usePostFormStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      images: post?.images || [], // Use images array
      content: post?.content || "",
      category: category || "",
    },
  });

  // Use a ref to track if the form has been initialized
  const formInitialized = useRef(false);

  useEffect(() => {
    if (!formInitialized.current && post) {
      form.reset(post);
      formInitialized.current = true;
    }
  }, [post]);

  const handleContentChange = (newContent: EditorContent) => {
    try {
      const parsedContent = typeof newContent === 'string'
        ? JSON.parse(newContent)
        : newContent;

      setContent(parsedContent);
      form.setValue("content", JSON.stringify(parsedContent));
    } catch (error) {
      console.error('Error handling content:', error);
      // Fallback to empty content
      setContent({ type: 'doc', content: [] });
    }
  };

  const resetForm = () => {
    form.reset();
    setContent({ type: 'doc', content: [] });
    setResetTrigger(prev => prev + 1);
    form.setValue("images", []);
  };

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    toast({
      title: post ? "Updating post..." : "Creating post...",
      description: `Please wait while we ${post ? 'update' : 'create'} your post.`,
    });

    try {
      const postData = {
        ...values,
        status: postStatus,
        category: category || values.category, // Fallback to form value if store value is undefined
      };

      if (mode === "edit" && post) {
        await updatePost({
          id: post._id,
          ...postData,
        });
      } else {
        await addPost(postData);
      }

      resetForm();
      router.push('/dashboard/blogs');

      toast({
        title: "Success",
        description: `Post ${post ? 'updated' : 'created'} successfully!`,
        variant: "default",
      });
    } catch (error) {
      console.error(post ? "Error updating post:" : "Error creating post:", error);
      toast({
        title: "Error",
        description: `Failed to ${post ? 'update' : 'create'} post. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { watch } = form;
  const title = watch("title");

  useEffect(() => {
    const slug = cleanSlug(title);
    form.setValue("slug", slug);
  }, [title, form]);

  useEffect(() => {
    if (content) {
      let plainText = '';
      const extractText = (node: JSONContent) => {
        if (typeof node.text === 'string') {
          plainText += node.text + ' ';
        }
        if (Array.isArray(node.content)) {
          node.content.forEach(extractText);
        }
      };

      extractText(content);
      plainText = plainText.trim();
      const words = plainText.split(/\s+/);
      let excerpt = words.slice(0, 30).join(' ');

      if (words.length > 30) {
        excerpt += '...';
      }

      // Only update if the excerpt has actually changed
      const currentExcerpt = form.getValues("excerpt");
      if (excerpt && excerpt !== currentExcerpt) {
        form.setValue("excerpt", excerpt, { shouldValidate: false });
      }
    }
  }, [content]);

  const categoryInitialized = useRef(false);

  useEffect(() => {
    if (!categoryInitialized.current && categories.length > 0 && form.getValues('category') === "") {
      const defaultCategory = post?.category || categories[0].title;
      form.setValue('category', defaultCategory, {
        shouldValidate: false,
        shouldDirty: false
      });
      categoryInitialized.current = true;
    }
  }, [categories.length, post?.category]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Create a new post</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormDescription>This is your post title.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Slug" {...field} />
                  </FormControl>
                  <FormDescription>This is your post slug.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <p className="pb-2">Content</p>
              <NovelEditor onContentChange={handleContentChange} content={content} ref={novelEditorRef} />
            </div>
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your excerpt here..."
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.setValue("excerpt", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>{`
                    This is your post excerpt. It's automatically generated from your content,
                    but you can edit it to customize how your post appears in summaries.`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
            <CardDescription>Select a category</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  {/* <CategorySelector control={form.control} categories={categories} /> */}
                  <PostCategorySelector
                    control={form.control}
                    categories={categories}
                    defaultValue={post?.category}
                    onChange={(value: string) => {
                      field.onChange(value);
                    }}
                  />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="text-right">
          <div className="text-right">
            <Button
              type="submit"
              variant="default"
              style={{ backgroundColor: "#000", color: "#fff" }}
            // disabled={isSubmitting || !form.formState.isDirty}
            >
              {isSubmitting ? "Submitting..." : (mode === "edit" ? "Update" : "Submit")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
