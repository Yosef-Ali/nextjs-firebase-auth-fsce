import { PortableTextBlock } from '@portabletext/types';

export type ResourceType = 'publication' | 'report' | 'toolkit' | 'research';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  slug: string;
  content?: string;
  coverImage?: string;
  fileUrl: string;
  downloadCount: number;
  published: boolean;
  publishedDate: number;
  createdAt: number;
  updatedAt: number;
}

export interface ResourceStatistics {
  totalResources: number;
  totalDownloads: number;
  resourcesByType: {
    [key in ResourceType]: number;
  };
}
