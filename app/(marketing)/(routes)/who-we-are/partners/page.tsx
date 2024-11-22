"use client";

import React, { useState, useEffect } from 'react';
import PartnersGrid from './_components/PartnersGrid';
import PartnersGridSkeleton from './_components/PartnersGridSkeleton';
import CarouselSection from "@/components/carousel";

const partners = [
  {
    name: "Kinder Not Hilfe",
    position: "Strategic Partner",
    imageUrl: "/images/Logo-Kindernothilfe.svg.png",
    description: "Kinder Not Hilfe supports childrens education and well-being globally, bringing over 20 years of expertise.",
    majorSponsor: true,
    link: "https://www.kindernothilfe.org/"
  },
  {
    name: "International Organization for Migration (IOM)",
    position: "Strategic Partner",
    imageUrl: "/images/iom.jpg",
    description: "The International Organization for Migration (IOM) supports migration and humanitarian efforts worldwide, providing assistance to vulnerable populations and fostering safe migration practices.",
    majorSponsor: true,
    link: "https://www.iom.int/"
  },
  {
    name: "Defence for Children International (DCI)",
    position: "Strategic Partner",
    imageUrl: "/images/usaid.png",
    description: "Partner Three manages the financial aspects of the company and ensures fiscal responsibility.",
    featured: true,
    link: "https://defenceforchildren.org/"
  },
  {
    name: "ECPAT International",
    position: "Supporting Partner",
    imageUrl: "/images/ECPAT_logo.png",
    description: "A global network dedicated to ending the sexual exploitation of children, advocating for better policies and protective measures worldwide."
  },
  {
    name: "Ethiopiaid",
    position: "Supporting Partner",
    imageUrl: "/images/ethiopiaid-logo-with-stapline.jpg",
    description: "Dedicated to helping the poorest people in Ethiopia, providing essential aid and support to uplift communities."
  },
  {
    name: "German Cooperation with Ethiopia",
    position: "Supporting Partner",
    imageUrl: "/images/EW1ousPXYAAI_L4.jpg",
    description: "A partnership between Germany and Ethiopia, working together to foster development and support mutual growth."
  },
  {
    name: "Family for Every Child",
    position: "Supporting Partner",
    imageUrl: "/images/family-for-every-child-logo.png",
    description: "A global alliance working to ensure every child grows up in a safe, caring family environment, free from violence and neglect."
  },
  {
    name: "Kinderpostzegels",
    position: "Supporting Partner",
    imageUrl: "/images/kinderpostzegels.png",
    description: "An initiative dedicated to supporting children's welfare, driven by children for children, and fostering a sense of community and care."
  },
  {
    name: "Ministry of Labour and Social Affairs(MoLSA)",
    position: "Supporting Partner",
    imageUrl: "/images/Logo-of-Ethiopian-Ministry-of-Labor-and-Social-Affairs.jpg",
    description: "A government body dedicated to improving social welfare and labor conditions, ensuring a better quality of life for all citizens."
  },
  {
    name: "American Speech-Language-Hearing Association (ASHA)",
    position: "Supporting Partner",
    imageUrl: "/images/oak_correct.png",
    description: "A professional organization committed to empowering and supporting audiologists and speech-language pathologists to provide the best care."
  }
];

export default function PartnersPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CarouselSection />
      <div className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Partners</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are proud to work with organizations that share our vision for protecting and empowering children.
          </p>
        </div>
        {loading ? (
          <PartnersGridSkeleton />
        ) : (
          <PartnersGrid partners={partners} />
        )}
      </div>
    </div>
  );
}