export interface AboutContent {
  id: string;
  title: string;
  content: any[] | any;
  section: string;
  published: boolean;
  coverImage?: string;
  images?: string[];
  createdAt: number;
  updatedAt: number;
  category: string;
  excerpt?: string;
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
