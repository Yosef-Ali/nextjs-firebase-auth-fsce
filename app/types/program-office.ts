export interface ProgramOffice {
  id: string;
  type: 'Program';
  region: string;
  location: string;
  address: string;
  contact: string;
  email: string;
  beneficiaries: string;
  programs: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type ProgramOfficeCreate = Omit<ProgramOffice, 'id' | 'createdAt' | 'updatedAt'>;

export type ProgramOfficeUpdate = Partial<ProgramOfficeCreate>;
