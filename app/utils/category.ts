import { Category, CategoryType } from '@/app/types/category';
import { Timestamp } from 'firebase/firestore';
import { toDate } from '../lib/timestamp';

export function getCategoryName(category: Category | string): string {
  return typeof category === 'string' ? category : category.name;
}

export function getCategoryId(category: Category | string): string {
  return typeof category === 'string' ? category : category.id;
}

export function ensureCategory(input: string | Category | undefined): Category {
  const now = Timestamp.now();

  if (!input) {
    return {
      id: 'default',
      name: 'Uncategorized',
      slug: 'uncategorized',
      type: 'post',
      featured: false,
      createdAt: now,
      updatedAt: now
    };
  }

  if (typeof input === 'string') {
    return {
      id: input,
      name: input,
      slug: input.toLowerCase().replace(/\s+/g, '-'),
      type: 'post',
      featured: false,
      createdAt: now,
      updatedAt: now
    };
  }

  return {
    ...input,
    featured: input.featured ?? false,
    type: input.type || 'post',
    createdAt: input.createdAt instanceof Timestamp ? input.createdAt : now,
    updatedAt: input.updatedAt instanceof Timestamp ? input.updatedAt : now
  };
}

export function isCategoryEqual(a: string | Category, b: string | Category): boolean {
  const idA = typeof a === 'string' ? a : a.id;
  const idB = typeof b === 'string' ? b : b.id;
  return idA.toLowerCase() === idB.toLowerCase();
}

// Helper function to create a complete category with proper timestamps
export function createCategory(data: Partial<Category> & { name: string }): Category {
  const now = Timestamp.now();
  return {
    id: data.id || '',
    name: data.name,
    slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
    type: data.type || 'post',
    featured: data.featured || false,
    description: data.description,
    icon: data.icon,
    createdAt: toDate(data.createdAt || now),
    updatedAt: toDate(data.updatedAt || now)
  };
}

// Helper function to normalize category data
export function normalizeCategory(category: string | Partial<Category> | undefined): Category {
  if (!category) {
    return createBaseCategory('', '');
  }

  if (typeof category === 'string') {
    return createBaseCategory(category, category);
  }

  const now = Timestamp.now();
  return {
    id: category.id || '',
    name: category.name || category.id || '',
    slug: category.slug || category.id?.toLowerCase() || '',
    type: category.type || 'post',
    featured: Boolean(category.featured),
    createdAt: toDate(category.createdAt || now),
    updatedAt: toDate(category.updatedAt || now)
  };
}

// Helper to create a basic category
export function createBasicCategory(name: string, type: CategoryType = 'post'): Category {
  const now = Timestamp.now();
  return {
    id: '',
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    type,
    featured: false,
    createdAt: now,
    updatedAt: now
  };
}

export function createBaseCategory(id: string, name: string, type: CategoryType = 'post'): Category {
  const now = Timestamp.now();
  return {
    id,
    name,
    slug: id.toLowerCase(),
    type,
    featured: false,
    createdAt: now,
    updatedAt: now
  };
}

export function normalizeCategoryInput(
  category: string | Partial<Category> | undefined,
  defaultId: string = ''
): Category {
  if (!category) {
    return createBaseCategory(defaultId, defaultId);
  }

  const now = Timestamp.now();
  const base = typeof category === 'string' ?
    createBaseCategory(category, category) :
    normalizeCategory(category);

  return {
    ...base,
    id: base.id || defaultId,
    name: base.name || defaultId,
    createdAt: toDate(base.createdAt || now),
    updatedAt: toDate(base.updatedAt || now)
  };
}
