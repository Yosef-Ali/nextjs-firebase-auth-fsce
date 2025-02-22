export interface Partner {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  email: string;
  phone: string;
  position: string;
  order: number;
  partnerType: 'partner' | 'membership';
  description?: string;
  createdAt: Date | number;
  updatedAt: Date | number;
}
