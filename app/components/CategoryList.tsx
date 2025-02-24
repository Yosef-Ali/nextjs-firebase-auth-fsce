import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirestoreQuery } from '@/app/hooks/useFirestoreQuery';

interface Category {
  id: string;
  name: string;
  // ... other fields
}

export function CategoryList() {
  const categoriesQuery = query(
    collection(db, 'categories'),
    orderBy('name', 'asc')
  );

  const { data: categories, loading, error } = useFirestoreQuery<Category>(categoriesQuery);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <ul>
      {categories.map((category) => (
        <li key={category.id}>{category.name}</li>
      ))}
    </ul>
  );
}