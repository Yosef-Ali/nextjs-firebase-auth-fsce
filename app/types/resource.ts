import { PortableTextBlock } from '@portabletext/types';

export type ResourceType = 'publication' | 'report' | 'toolkit' | 'research';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'mp3' | 'mp4' | 'jpg' | 'png';
  slug: string;
  content?: string;
  coverImage?: string;
  fileUrl: string;
  downloadCount: number;
  published: boolean;
  publishedDate?: number | null;
  createdAt: number;
  updatedAt: number;
  category: 'report' | 'publication' | 'media';
}

export interface ResourceStatistics {
  totalResources: number;
  totalDownloads: number;
  resourcesByType: {
    [key in ResourceType]: number;
  };
}
