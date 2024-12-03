import { LucideIcon } from 'lucide-react';

export interface Merit {
  id: string;
  title: string;
  description: string;
  iconName?: string;  // Store icon name in database
  icon?: React.ReactNode;  // Runtime icon component
  image?: string;
  date?: string;
  category?: string;
  approved?: boolean;
  featured?: boolean;
  longDescription?: string;
}
