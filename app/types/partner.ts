import { Timestamp, WithTimestamps } from './index';

export type PartnerType = 'membership' | 'strategic';

export interface Partner extends WithTimestamps {
  id: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  logo?: string;
  position: string;
  partnerType: PartnerType;
  order: number;
}

export type CreatePartnerInput = Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePartnerInput = Partial<Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>>;
