export type MediaType = 'image' | 'video' | 'document' | 'audio';

export interface Media {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  alt?: string;
  caption?: string;
  description?: string;
  tags?: string[];
  createdAt: number;
  updatedAt?: number;
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
