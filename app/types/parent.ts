export interface Parent {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    children: Child[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Child {
    id: string;
    name: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    schoolName?: string;
    grade?: string;
    medicalConditions?: string[];
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
}

export interface ParentClient extends Parent {
  // Add any additional client-specific fields here
}
