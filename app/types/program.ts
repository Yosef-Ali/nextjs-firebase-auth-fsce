export type ProgramCategory = 
  | 'prevention-promotion'
  | 'protection'
  | 'rehabilitation'
  | 'resource-center';

export interface Program {
  id: string;
  title: string;
  description: string;
  category: ProgramCategory;
  coverImage?: string;
  images?: string[];
  content: any; // Rich text content
  excerpt: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
  location?: string;
  beneficiaries?: string[];
  objectives?: string[];
  outcomes?: {
    title: string;
    description: string;
  }[];
  partners?: string[];
  resources?: {
    title: string;
    url: string;
    type: 'pdf' | 'doc' | 'video' | 'link';
  }[];
}

export interface ProgramStatistics {
  totalBeneficiaries: number;
  activePrograms: number;
  locations: number;
  successStories: number;
}
