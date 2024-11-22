"use client"

import React from 'react';
import Link from 'next/link';
import {  Home, Mail, Phone, Instagram } from 'lucide-react';
import Logo from '@/components/Logo';
import MetaIcon from '@/components/icons/MetaIcon';
import XIcon from '@/components/icons/XIcon';

interface FooterNavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
}

interface FooterNavSection {
  label: string;
  items: FooterNavItem[];
}

const Footer: React.FC = () => {
  const footerNavs: FooterNavSection[] = [
    {
      label: "Quick Links",
      items: [
        { name: 'Home', href: '/' },
        { name: 'Who We Are', href: '/who-we-are' },
        { name: 'What We Do', href: '/what-we-do' },
        { name: 'News', href: '/news' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      label: "Programs",
      items: [
        { name: 'Prevention & Promotion', href: '/what-we-do#prevention-promotion' },
        { name: 'Protection', href: '/what-we-do#protection' },
        { name: 'Rehabilitation', href: '/what-we-do#rehabilitation' },
        { name: 'Resource Center', href: '/what-we-do#resource-center' },
      ],
    },
    {
      label: "Contact",
      items: [
        { 
          name: 'Addis Ababa, Ethiopia', 
          href: '#',
          icon: Home
        },
        { 
          name: 'info@fsce.org', 
          href: 'mailto:info@fsce.org',
          icon: Mail
        },
        { 
          name: '+251 11 551 2696', 
          href: 'tel:+251115512696',
          icon: Phone
        },
      ],
    },
  ];

  return (
    <footer className="text-gray-300 dark:text-gray-400 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
          <div>
            <Logo white size={1.2} />
            <p className="mt-4 text-sm">
              Working together for child welfare and empowerment since 1989.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Link 
                href="https://facebook.com" 
                className="hover:text-primary transition-colors"
                aria-label="Visit our Facebook page"
              >
                <MetaIcon className="h-6 w-6" />
              </Link>
              <Link 
                href="https://twitter.com" 
                className="hover:text-primary transition-colors"
                aria-label="Visit our Twitter page"
              >
                <XIcon className="h-5 w-5" />
              </Link>
              
            </div>
          </div>
          {footerNavs.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-gray-300 dark:text-gray-200 font-semibold text-lg mb-4">
                {section.label}
              </h3>
              <ul className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link 
                      href={item.href}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm">
            &copy; {new Date().getFullYear()} FSCE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
