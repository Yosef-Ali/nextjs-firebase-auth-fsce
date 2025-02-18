export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  logo: string;
  website: string;
  order: number;
  partnerType: 'PREMIUM' | 'REGULAR';
  description: string;
  position: string;
  createdAt: Date | number;
  updatedAt: Date | number;
}
