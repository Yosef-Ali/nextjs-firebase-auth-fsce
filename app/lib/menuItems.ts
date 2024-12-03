export interface MenuItem {
  title: string;
  href?: string;
  items?: {
    title: string;
    href: string;
    description: string;
  }[];
}

export const menuItems: MenuItem[] = [
  {
    title: "Who We Are",
    href: "/",
    items: [
      { title: "Values and Principles", href: "/", description: "Our core beliefs and guiding principles" },
      { title: "Board Members", href: "/who-we-are/board-members", description: "Meet our leadership team" },
      { title: "Partners", href: "/who-we-are/partners", description: "Our collaborators and supporters" },
      { title: "Merits", href: "/who-we-are/merits", description: "Our achievements and recognitions" },
    ],
  },
  {
    title: "What We Do",
    href: "/what-we-do",
    items: [
      { title: "Prevention and Promotion Program", href: "/what-we-do/prevention-promotion", description: "Proactive measures for child welfare" },
      { title: "Protection", href: "/what-we-do/protection", description: "Safeguarding children's rights and safety" },
      { title: "Rehabilitation and Reintegration", href: "/what-we-do/rehabilitation", description: "Supporting children's recovery and social integration" },
      { title: "Child Resource Center", href: "/what-we-do/resource-center", description: "Educational and support facilities for children" },
    ],
  },
  {
    title: "Where We Work",
    href: "/where-we-work",
    items: [
      { title: "City Area Program Offices", href: "/where-we-work/city-offices", description: "Our urban program locations" },
      { title: "Regional Area Program Offices", href: "/where-we-work/regional-offices", description: "Our presence across different regions" },
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
    href: "/contact",
  },
];
