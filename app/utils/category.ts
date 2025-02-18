import { Category } from '@/app/types/category';

// Helper function to convert to timestamp
const toTimestamp = (date: Date | number | any): number => {
  if (typeof date === 'number') return date;
  if (date instanceof Date) return date.getTime();
  if (date?.toDate instanceof Function) return date.toDate().getTime();
  return Date.now();
};

export function getCategoryName(category: string | Category | undefined): string {
  if (!category) return 'Uncategorized';
  if (typeof category === 'string') return category;
  return category.name;
}

export function getCategoryId(category: string | Category | undefined): string {
  if (!category) return '';
  if (typeof category === 'string') return category;
  return category.id;
}

export function ensureCategory(category: string | Category): Category {
  if (typeof category === 'string') {
    return {
      id: category,
      name: category,
      slug: category.toLowerCase(),
      type: 'post',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
  return category;
}

export function isCategoryEqual(a: string | Category, b: string | Category): boolean {
  const idA = typeof a === 'string' ? a : a.id;
  const idB = typeof b === 'string' ? b : b.id;
  return idA.toLowerCase() === idB.toLowerCase();
}

// Helper function to create a complete Category object
function createCategory(id: string, name: string, type: CategoryType = 'post'): Category {
  const now = Date.now();
  return {
    id,
    name,
    type,
    featured: false,
    slug: id.toLowerCase(),
    createdAt: now,
    updatedAt: now
  };
}
