"use client";

import { useRouter, useParams } from "next/navigation";
import { PostForm } from "@/app/dashboard/_components/posts/PostForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import { Post } from "@/app/types/post";
import { doc, getDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizePost } from "@/app/utils/post";
import { Category } from "@/app/types/category";
import { safeToast } from "@/app/utils/toast-helper";

export default function EditPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<{
    post: Post | null;
    categories: Category[];
  }>({
    post: null,
    categories: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Single effect to load both post and categories
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        // Load both post and categories concurrently for better performance
        const [postDoc, categoriesSnapshot] = await Promise.all([
          getDoc(doc(db, "posts", id)),
          getDocs(collection(db, "categories"))
        ]);

        // Process categories with more robust handling
        const categories = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.id,
          slug: doc.data().slug || doc.id.toLowerCase(),
          type: doc.data().type || 'post',
          featured: doc.data().featured || false,
          description: doc.data().description || "",
          createdAt: doc.data().createdAt || Timestamp.now(),
          updatedAt: doc.data().updatedAt || doc.data().createdAt || Timestamp.now()
        } as Category));

        // Process post with improved error handling
        let post: Post | null = null;
        if (postDoc.exists()) {
          const postData = postDoc.data();
          // Ensure consistent post format using normalize function
          post = normalizePost(postData, postDoc.id);

          // If the post has a category ID but no category object, find it in the categories
          if (typeof post.category === 'string') {
            const categoryId = post.category;
            const category = categories.find(c => c.id === categoryId);
            if (category) {
              post.category = category;
            }
          }
        }

        setData({ post, categories });
      } catch (error) {
        console.error("Error loading data:", error);
        if (toast) {
          safeToast(toast, {
            title: "Error",
            description: "Failed to load post data. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only load data if user authentication is completed
    if (!authLoading) {
      loadData();
    }
  }, [id, toast, authLoading]);


  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {data.post ? (
        <PostForm
          post={data.post}
          categories={data.categories}
          onSuccess={() => router.push("/dashboard/posts")}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 border rounded-lg">
          <h2 className="text-xl font-semibold">Post Not Found</h2>
          <p className="text-muted-foreground text-center">
            The post couldn't be loaded. This could be because it doesn't exist or there was an error.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/posts")}>
              Back to Posts
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
