import { PortableTextBlock } from '@portabletext/types';

export type LocationType = 'city' | 'regional';

export interface LocationStatistics {
  totalLocations: number;
  cityOffices: number;
  regionalOffices: number;
  beneficiariesReached: number;
}

export interface Location {
  id: string;
  title: string;
  type: LocationType;
  description: PortableTextBlock[];
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  image: string;
  beneficiariesCount: number;
  programs: string[];
  staff: {
    name: string;
    role: string;
    image?: string;
  }[];
  contactInfo: {
    phone: string;
    email: string;
  };
  published: boolean;
  createdAt: number;
  updatedAt: number;
}
