import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirestoreQuery } from '@/app/hooks/useFirestoreQuery';

interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  type?: 'post' | 'resource' | 'event';
  featured?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export function CategoryList() {
  const categoriesQuery = query(
    collection(db, 'categories'),
    orderBy('name', 'asc')
  );

  const { data: categories, loading, error } = useFirestoreQuery<Category>(categoriesQuery);

  if (loading) return <div>Loading categories...</div>;
  if (error) {
    console.error('Error loading categories:', error);
    return <div>Error loading categories</div>;
  }
  if (!categories?.length) {
    return <div>No categories found</div>;
  }

  // Deduplicate and validate categories
  const uniqueCategories = Array.from(
    new Map(
      categories
        .filter(category => {
          if (!category?.id) {
            console.warn('Found category without ID:', category);
            return false;
          }
          if (!category?.name) {
            console.warn('Found category without name:', category);
            return false;
          }
          return true;
        })
        .map(category => {
          const normalizedId = category.id.toLowerCase().trim();
          // Log any ID normalization that occurs
          if (normalizedId !== category.id) {
            console.info(`Normalized category ID from "${category.id}" to "${normalizedId}"`);
          }
          return [normalizedId, {
            ...category,
            id: normalizedId,
            name: category.name.trim()
          }];
        })
    ).values()
  );

  if (!uniqueCategories.length) {
    console.warn('No valid categories after deduplication');
    return <div>No valid categories found</div>;
  }

  return (
    <ul className="space-y-2">
      {uniqueCategories.map((category) => (
        <li key={category.id} className="px-4 py-2 bg-background rounded-md">
          {category.name}
        </li>
      ))}
    </ul>
  );
}
