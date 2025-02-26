import { Timestamp, FieldValue } from 'firebase/firestore';

declare module 'firebase/firestore' {
    interface Timestamp { }
}

declare global {
    type FirebaseTimestamp = Timestamp;
    type DateLike = Date | Timestamp | number;
    type MaybeTimestamp = Timestamp | Date | number;

    interface WithTimestamps {
        createdAt: FirebaseTimestamp;
        updatedAt: FirebaseTimestamp;
    }

    // Category types
    interface Category extends WithTimestamps {
        id: string;
        name: string;
        slug: string;
        description: string;
        type: CategoryType;
        featured?: boolean;
        icon?: string;
        itemCount?: number;
    }

    type CategoryType = 'post' | 'resource' | 'award' | 'recognition';

    type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
    type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>;

    // Helper type for objects containing optional category references
    interface WithCategory {
        category: Category | string;
    }
}

export type { DateLike, FirebaseTimestamp, WithTimestamps, Category, CategoryType, CreateCategoryInput, UpdateCategoryInput, WithCategory };
