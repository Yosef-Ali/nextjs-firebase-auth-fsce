"use client";

import React from 'react';
import CarouselSection from "@/components/carousel";
import PartnersGrid from './_components/PartnersGrid';

const partners = [
  {
    name: "Kinder Not Hilfe",
    position: "Strategic Partner",
    logo: "/images/Logo-Kindernothilfe.svg.png",
    bio: "Kinder Not Hilfe supports childrens education and well-being globally, bringing over 20 years of expertise."
  },
  {
    name: "International Organization for Migration (IOM)",
    position: "Strategic Partner",
    logo: "/images/iom.jpg",
    bio: "The International Organization for Migration (IOM) supports migration and humanitarian efforts worldwide, providing assistance to vulnerable populations and fostering safe migration practices."
  },
  {
    name: "Defence for Children International (DCI)",
    position: "Strategic Partner",
    logo: "/images/usaid.png",
    bio: "Partner Three manages the financial aspects of the company and ensures fiscal responsibility."
  },
  {
    name: "ECPAT International",
    position: "Supporting Partner",
    logo: "/images/ECPAT_logo.png",
    bio: "A global network dedicated to ending the sexual exploitation of children, advocating for better policies and protective measures worldwide."
  },
  {
    name: "Ethiopiaid",
    position: "Supporting Partner",
    logo: "/images/ethiopiaid-logo-with-stapline.jpg",
    bio: "Dedicated to helping the poorest people in Ethiopia, providing essential aid and support to uplift communities."
  },
  {
    name: "German Cooperation with Ethiopia",
    position: "Supporting Partner",
    logo: "/images/EW1ousPXYAAI_L4.jpg",
    bio: "A partnership between Germany and Ethiopia, working together to foster development and support mutual growth."
  },
  {
    name: "Family for Every Child",
    position: "Supporting Partner",
    logo: "/images/family-for-every-child-logo.png",
    bio: "A global alliance working to ensure every child grows up in a safe, caring family environment, free from violence and neglect."
  },
  {
    name: "Kinderpostzegels",
    position: "Supporting Partner",
    logo: "/images/kinderpostzegels.png",
    bio: "An initiative dedicated to supporting children's welfare, driven by children for children, and fostering a sense of community and care."
  },
  {
    name: "Ministry of Labour and Social Affairs(MoLSA)",
    position: "Supporting Partner",
    logo: "/images/Logo-of-Ethiopian-Ministry-of-Labor-and-Social-Affairs.jpg",
    bio: "A government body dedicated to improving social welfare and labor conditions, ensuring a better quality of life for all citizens."
  },
  {
    name: "American Speech-Language-Hearing Association (ASHA)",
    position: "Supporting Partner",
    logo: "/images/oak_correct.png",
    bio: "A professional organization committed to empowering and supporting audiologists and speech-language pathologists to provide the best care."
  }
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-background">
      <CarouselSection />
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Partners</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are proud to work with organizations that share our commitment to making a positive impact in our community.
              Together, we create lasting change and build a better future.
            </p>
          </div>
          <PartnersGrid partners={partners} />
        </div>
      </section>
    </div>
  );
}