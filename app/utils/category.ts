import { Category } from '@/app/types/category';

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