export interface Partner {
  id: string;
  name: string;
  logo?: string;  // Making logo explicitly optional since we handle undefined cases
  website?: string;  // Making website optional to match form schema
  email: string;
  phone: string;
  order: number;
  position?: number; // Adding position field as optional to maintain compatibility
  partnerType: 'strategic' | 'membership';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
