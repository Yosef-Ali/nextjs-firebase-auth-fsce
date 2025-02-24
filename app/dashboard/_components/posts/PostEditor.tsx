import { useEffect, useState } from 'react';
import { Category } from '@/app/types/category';
import { categoryService } from '@/app/services/categories';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/lib/hooks/useAuth';

export function PostEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();

  const fetchCategories = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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

  // Rest of your component code...
}
