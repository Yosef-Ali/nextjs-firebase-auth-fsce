import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Image as ImageIcon,
  Newspaper,
  Building2,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  href?: string;
  icon?: any;
  admin?: boolean;
  items?: {
    title: string;
    href: string;
    description: string;
  }[];
}

export const menuItems: MenuItem[] = [
  {
    title: "Who We Are",
    href: "/who-we-are",
    items: [
      { title: "Vision, Mission, and Values", href: "/who-we-are", description: "Our core beliefs and guiding principles" },
      { title: "Board Members", href: "/who-we-are/board-members", description: "Meet our leadership team" },
      { title: "Partners", href: "/who-we-are/partners", description: "Our collaborators and supporters" },
      { title: "Achievements", href: "/who-we-are/achievements", description: "Our achievements and recognitions" },
    ],
  },
  {
    title: "What We Do",
    href: "/what-we-do",
    items: [
      { title: "Child Protection", href: "/what-we-do/child-protection", description: "Ensuring safety and well-being of children" },
      { title: "Youth Empowerment", href: "/what-we-do/youth-empowerment", description: "Empowering youth for a better future" },
      { title: "Advocacy", href: "/what-we-do/advocacy", description: "Speaking up for children's rights and needs" },
      { title: "Humanitarian Response", href: "/what-we-do/humanitarian-response", description: "Providing critical support in times of need" },
    ],
  },
  {
    title: "Where We Work",
    href: "/where-we-work",
    items: [
      { title: "Program Offices", href: "/where-we-work", description: "Our comprehensive network of city and regional offices" },
    ],
  },
  {
    title: "News and Events",
    items: [
      { title: "News", href: "/news", description: "Stay updated with our latest activities, achievements, and initiatives" },
      { title: "Events", href: "/events", description: "Discover upcoming programs, workshops, and community gatherings" },
    ],
  },
  {
    title: "Resources",
    href: "/resources"
  },
  {
    title: "Contact Us",
    href: "/contact"
  }
];
