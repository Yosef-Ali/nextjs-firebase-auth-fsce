// app/types/office.ts

export interface Office {
  id: string;
  name: string;
  location: string;
  contact: string;
  email: string;
  impact: string;
  impactCount: number;
  programs: string[];
  active: boolean;
}