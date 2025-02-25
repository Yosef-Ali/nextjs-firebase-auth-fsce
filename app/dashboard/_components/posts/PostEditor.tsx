import { useEffect, useState } from 'react';
import { Category } from '@/app/types/category';
import { categoryService } from '@/app/services/categories';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/lib/hooks/useAuth';
import PostForm from './PostForm';
import { Post } from '@/app/types/post';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];

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

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]); // Dependency array includes user to run fetchCategories when user changes

  return (
    <div className="space-y-4">
      <PostForm
        post={post}
        initialData={initialData}
        categories={categories}
        onSuccess={onSuccess}
      />
    </div>
  );
}

export default PostEditor;
