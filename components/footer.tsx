"use client";

import React from "react";
import Link from "next/link";

import {
  FacebookIcon,
  TwitterIcon,
  HomeIcon,
  EmailIcon,
  TelephoneIcon,
  FaxIcon,
} from "@/app/icons";
import { Logo } from "./Logo";

// Custom X icon component
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface FooterNavItem {
  name: string;
  href?: string;
  icon?: (props: React.ComponentProps<"svg">) => JSX.Element;
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
        {
          name: "Home",
          href: "/",
        },
        {
          name: "Who We Are",
          href: "/who-we-are",
        },
        {
          name: "What We Do",
          href: "/what-we-do",
        },
        {
          name: "Where We Work",
          href: "/where-we-work",
        },
        {
          name: "News & Events",
          href: "/news",
        },
      ],
    },
    {
      label: "Programs",
      items: [
        {
          name: "Child Protection",
          href: "/what-we-do/child-protection",
        },
        {
          name: "Youth Empowerment",
          href: "/what-we-do/youth-empowerment",
        },
        {
          name: "Advocacy",
          href: "/what-we-do/advocacy",
        },
        {
          name: "Humanitarian Response",
          href: "/what-we-do/humanitarian-response",
        },
      ],
    },
    {
      label: "Resources",
      items: [
        {
          name: "News Articles",
          href: "/news",
        },
        {
          name: "Upcoming Events",
          href: "/events",
        },
        {
          name: "Reports & Publications",
          href: "/resources",
        },
        {
          name: "Partner Organizations",
          href: "/who-we-are/partners",
        },
        {
          name: "Board Members",
          href: "/who-we-are/board-members",
        },
      ],
    },
    {
      label: "Contact",
      items: [
        {
          name: "Addis Ababa, Ethiopia",
          icon: HomeIcon as (props: React.ComponentProps<"svg">) => JSX.Element,
        },
        {
          name: "contact@fsc-e.org",
          icon: EmailIcon as (
            props: React.ComponentProps<"svg">
          ) => JSX.Element,
        },
        {
          name: "Tel: 251-111705024",
          icon: TelephoneIcon as (
            props: React.ComponentProps<"svg">
          ) => JSX.Element,
        },
        {
          name: "Tel: 251-118333927",
          icon: TelephoneIcon as (
            props: React.ComponentProps<"svg">
          ) => JSX.Element,
        },
        {
          name: "Fax: +251 111705234",
          icon: FaxIcon as (props: React.ComponentProps<"svg">) => JSX.Element,
        },
        {
          name: "www.fsc-e.org",
          icon: EmailIcon as (
            props: React.ComponentProps<"svg">
          ) => JSX.Element,
        },
      ],
    },
  ];

  const ContactSection = () => {
    const { label, items } = footerNavs.find(
      (section) => section.label === "Contact"
    ) || { label: "", items: [] };
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-center text-gray-300">
            {item.icon && (
              <span className="mr-3 [&>svg]:h-5 [&>svg]:w-5">
                <item.icon />
              </span>
            )}
            <span className="duration-150 hover:text-gray-400">
              {item.name}
            </span>
          </li>
        ))}
      </div>
    );
  };

  return (
    <footer className="pt-10 bg-blue-950">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="justify-between items-center gap-12 md:flex">
          <div className="flex-1 max-w-lg">
            <Logo white />
            <h3 className="text-muted mt-4 text-lg">
              Forum on Sustainable Child Empowerment.
            </h3>
          </div>
          <div className="flex-1 mt-6 md:mt-0">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-x-3 md:justify-end"
            >
              <div className="relative">
                <svg
                  className="w-6 h-6 text-gray-400 absolute left-3 inset-y-0 my-auto opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                <input
                  type="email"
                  placeholder="Subscription coming soon"
                  disabled
                  className="w-full pl-12 pr-3 py-2 text-gray-500 bg-white/90 outline-none border focus:border-indigo-600 shadow-sm rounded-lg cursor-not-allowed opacity-75"
                />
              </div>
              <button
                disabled
                className="block w-auto py-3 px-4 font-medium text-sm text-center text-white bg-indigo-600/75 rounded-lg shadow cursor-not-allowed opacity-75"
                title="Coming soon"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mt-16 sm:grid-cols-3 lg:grid-cols-4">
          {footerNavs.map((item, idx) => (
            <ul className="space-y-4" key={idx}>
              <h4 className="text-gray-200 font-semibold">{item.label}</h4>
              {item.label === "Contact" ? (
                <ContactSection />
              ) : (
                item.items.map((el, idx) => (
                  <li key={idx}>
                    {el.href ? (
                      <Link
                        href={el.href}
                        className="text-gray-300 duration-150 hover:text-gray-400 cursor-pointer"
                      >
                        {el.name}
                      </Link>
                    ) : (
                      <span className="text-gray-300 duration-150 hover:text-gray-400 cursor-pointer">
                        {el.name}
                      </span>
                    )}
                  </li>
                ))
              )}
            </ul>
          ))}
        </div>
        <div className="mt-10 py-10 border-t border-gray-700 items-center justify-between sm:flex">
          <p className="text-gray-300">
            © {new Date().getFullYear()} Forum on Sustainable Child Empowerment.
            All rights reserved.
          </p>
          <div className="flex items-center gap-x-6 text-gray-400 mt-6 sm:mt-0">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (formerly Twitter)"
            >
              <XIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
