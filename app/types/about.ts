export interface AboutContent {
  id: string;
  title: string;
  content: string;
  section: string;
  published: boolean;
  coverImage?: string;
  images?: string[];
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  updatedBy?: string;
  category: string;
  excerpt?: string;
  authorId: string;
  authorEmail: string;
  slug: string;
}

export interface VisionMissionGoal {
  title: string;
  description: string;
  icon?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description: string;
  website?: string;
}
