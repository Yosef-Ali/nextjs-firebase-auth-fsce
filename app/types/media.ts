export type MediaType = 'image' | 'video' | 'document' | 'audio';

export interface Media {
  id: string;
  name: string;
  description?: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  tags?: string[];
  alt?: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: string;
  uploadedByEmail: string;
}

export type CreateMediaInput = Omit<Media, 'id' | 'createdAt' | 'updatedAt' | 'thumbnailUrl'>;

export interface MediaFilter {
  type?: MediaType;
  tags?: string[];
  uploadedBy?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
