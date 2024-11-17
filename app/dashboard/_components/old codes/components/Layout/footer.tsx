"use client"

import React from 'react';
import { FacebookIcon, TwitterIcon, GithubIcon, InstagramIcon, HomeIcon, EmailIcon, TelephoneIcon, FaxIcon, } from '../icons';
import Logo from '../logo';


interface FooterNavItem {
  name: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  icon?: (props: React.ComponentProps<'svg'>) => JSX.Element; // Added icon property
}

interface FooterNavSection {
  label: string;
  items: FooterNavItem[];
}



const Footer: React.FC = () => {
  const footerNavs: FooterNavSection[] = [
    {
      label: "Home",
      items: [
        {
          name: 'Home',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'Categories',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'About',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'Contact',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
      ],
    },
    {
      label: "About",
      items: [
        {
          name: 'Adama',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'Addis Ababa',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'Bahir Dar',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'Dessie',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'Dire Dawa',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
      ]
    },
    {
      label: "Resources",
      items: [
        {
          name: 'Child Corner',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'Partners',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'Get Involved',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'Vacancies and Bids',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
        {
          name: 'Downloads',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        },
      ],
    },
    {
      label: "Contact",
      items: [
        {
          name: 'Addis Ababa, Ethiopia',
          icon: HomeIcon as (props: React.ComponentProps<'svg'>) => JSX.Element,
        },
        {
          name: 'info@fsc-e.org',
          icon: EmailIcon as (props: React.ComponentProps<'svg'>) => JSX.Element,
        },
        {
          name: '+ 251 115 534 722',
          icon: TelephoneIcon as (props: React.ComponentProps<'svg'>) => JSX.Element,
        },
        {
          name: '+ 251 115 534 469',
          icon: FaxIcon as (props: React.ComponentProps<'svg'>) => JSX.Element,
        },
        {
          name: '9562',
          icon: EmailIcon as (props: React.ComponentProps<'svg'>) => JSX.Element,
        },
      ],
    }
  ];

  const ContactSection = () => {
    const { label, items } = footerNavs.find(section => section.label === 'Contact') || { label: '', items: [] };
    return (
      <div>
        {/* ... */}
        {items.map((item, index) => (
          <p key={index} className={`mb-4 flex items-center justify-center md:justify-start ${index === items.length - 1 ? '' : 'mb-4'}`}>
            {item.icon ? (
              <span className="me-3 [&>svg]:h-5 [&>svg]:w-5">
                <item.icon /> {/* Call the icon component as a function */}
              </span>
            ) : null}
            {item.name}
          </p>
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
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-x-3 md:justify-end">
              <div className="relative">
                <svg className="w-6 h-6 text-gray-400 absolute left-3 inset-y-0 my-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-3 py-2 text-gray-500 bg-white outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                />
              </div>
              <button className="block w-auto py-3 px-4 font-medium text-sm text-center text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:shadow-none rounded-lg shadow">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="flex-1 mt-16 space-y-6 justify-between sm:flex md:space-y-0">
          {footerNavs.map((item, idx) => (
            <ul className="space-y-4 text-gray-300" key={idx}>
              <h4 className="text-gray-200 font-semibold sm:pb-2">{item.label}</h4>
              {item.label === 'Contact' ? (
                <ContactSection />
              ) : (
                item.items.map((el, idx) => (
                  <li key={idx}>
                    <a
                      onClick={el.onClick}
                      className="duration-150 hover:text-gray-400 cursor-pointer"
                    >
                      {el.name}
                    </a>
                  </li>
                ))
              )}
            </ul>
          ))}
        </div>
        <div className="mt-10 py-10 border-t border-gray-700 items-center justify-between sm:flex">
          <p className="text-gray-300">© 2022 Float UI Inc. All rights reserved.</p>
          <div className="flex items-center gap-x-6 text-gray-400 mt-6">
            <a href="#" onClick={(e) => e.preventDefault()}>
              <FacebookIcon />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <TwitterIcon />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <GithubIcon />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer