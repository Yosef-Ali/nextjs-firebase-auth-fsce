import { Category, CategoryType } from '@/app/types/category';
import { Timestamp } from 'firebase/firestore';
import { toDate } from '../lib/timestamp';

export function getCategoryName(category: Category | string): string {
  return typeof category === 'string' ? category : category.name;
}

export function getCategoryId(category: Category | string): string {
  return typeof category === 'string' ? category : category.id;
}

export function ensureCategory(input: string | Category | undefined | null): Category {
  const now = Timestamp.now();

  try {
    // Handle null, undefined, or empty string
    if (!input) {
      return {
        id: 'default',
        name: 'Uncategorized',
        slug: 'uncategorized',
        type: 'post' as CategoryType,
        featured: false,
        createdAt: now,
        updatedAt: now
      };
    }

    // Handle string input
    if (typeof input === 'string') {
      return {
        id: input || 'default',
        name: input || 'Uncategorized',
        slug: input ? input.toLowerCase().replace(/\s+/g, '-') : 'uncategorized',
        type: 'post' as CategoryType,
        featured: false,
        createdAt: now,
        updatedAt: now
      };
    }

    // Validate that input is an object
    if (typeof input !== 'object') {
      console.warn('Invalid category input type:', typeof input);
      return {
        id: 'default',
        name: 'Uncategorized',
        slug: 'uncategorized',
        type: 'post' as CategoryType,
        featured: false,
        createdAt: now,
        updatedAt: now
      };
    }

    // Handle case where input might be an object but not have all required properties
    return {
      id: input.id || 'default',
      name: input.name || 'Uncategorized',
      slug: input.slug || (input.name ? input.name.toLowerCase().replace(/\s+/g, '-') : 'uncategorized'),
      type: input.type || 'post' as CategoryType,
      featured: input.featured ?? false,
      description: input.description || '',
      createdAt: input.createdAt instanceof Timestamp ? input.createdAt : now,
      updatedAt: input.updatedAt instanceof Timestamp ? input.updatedAt : now
    };
  } catch (error) {
    console.error('Error in ensureCategory:', error, input);
    // Return a default category in case of any error
    return {
      id: 'default',
      name: 'Uncategorized',
      slug: 'uncategorized',
      type: 'post' as CategoryType,
      featured: false,
      createdAt: now,
      updatedAt: now
    };
  }
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
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
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
    createdAt: category.createdAt || now,
    updatedAt: category.updatedAt || now
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
    createdAt: base.createdAt || now,
    updatedAt: base.updatedAt || now
  };
}
