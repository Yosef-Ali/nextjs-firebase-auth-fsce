'use client';

import { useRouter, useParams } from 'next/navigation';
import { PostForm } from '@/app/dashboard/_components/posts/PostForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Post } from '@/app/types/post';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { normalizePost } from '@/app/utils/post';
import { Category } from '@/app/types/category';

export default function EditPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          slug: doc.data().slug,
          type: doc.data().type,
          featured: doc.data().featured || false,
          description: doc.data().description || '',
          createdAt: doc.data().createdAt,
          updatedAt: doc.data().updatedAt || doc.data().createdAt
        } as Category));
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive"
        });
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          try {
            const postData = docSnap.data();
            // Handle field normalization safely to prevent missing field errors
            const normalizedPost = normalizePost(postData, docSnap.id);
            setPost(normalizedPost);
          } catch (normalizeError) {
            console.error("Error normalizing post data:", normalizeError);
            toast({
              title: "Error",
              description: "Error processing post data",
              variant: "destructive"
            });
            router.push('/dashboard/posts');
          }
        } else {
          toast({
            title: "Error",
            description: "Post not found",
            variant: "destructive"
          });
          router.push('/dashboard/posts');
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Error",
          description: "Failed to load post",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

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
      {post && (
        <PostForm
          post={post}
          categories={categories}
          onSuccess={() => router.push('/dashboard/posts')}
        />
      )}
    </div>
  );
}
