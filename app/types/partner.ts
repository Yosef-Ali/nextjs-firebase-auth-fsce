export interface Partner {
  id: string;
  name: string;
  email: string;
  order: number;
  phone: string;
  partnerType: "partner" | "membership";
  description?: string;
  logo?: string;
  website?: string;
}
