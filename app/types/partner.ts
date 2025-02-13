export interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
  partnerType: 'strategic' | 'membership';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
