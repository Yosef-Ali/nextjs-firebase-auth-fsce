import { WithTimestamps } from './index';

export interface Child {
    name: string;
    age: number;
    grade?: string;
}

export interface Parent extends WithTimestamps {
    id: string;
    name: string;
    email: string;
    phone: string;
    children: Child[];
    photoURL?: string;
}

export type CreateParentInput = Omit<Parent, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateParentInput = Partial<Omit<Parent, 'id' | 'createdAt' | 'updatedAt'>>;

export interface ParentClient extends Parent {
    // Add any additional client-specific fields here
}
