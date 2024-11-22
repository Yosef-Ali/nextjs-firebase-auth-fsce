export type ProgramCategory = 
  | 'prevention-promotion'
  | 'protection'
  | 'rehabilitation'
  | 'resource-center';

export interface Program {
  id: string;
  title: string;
  description: string;
  content: string;
  category: ProgramCategory;
  coverImage?: string;
  images?: string[];
  excerpt: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  metadata: Record<string, unknown>;
}

export interface ProgramStatistics {
  totalBeneficiaries: number;
  activePrograms: number;
  locations: number;
  successStories: number;
}
