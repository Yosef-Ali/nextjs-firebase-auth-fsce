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
}

export type ProgramOfficeCreate = Omit<ProgramOffice, 'id'>;
export type ProgramOfficeUpdate = Partial<ProgramOffice>;
