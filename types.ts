export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  logo?: string;
  position: string;
  partnerType: 'partner' | 'membership';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
