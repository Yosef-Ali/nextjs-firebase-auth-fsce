"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import EthiopianMap from './_components/EthiopianMap';
import { Building2, MapPin } from 'lucide-react';
import CarouselSection from "@/components/carousel";
import LocationsGrid from './_components/LocationsGrid';
import LocationsMap from './_components/locations-map';

const locations = [
  {
    region: "Addis Ababa",
    city: "Addis Ababa",
    address: "Bole Sub-City, Woreda 03, Building No. 345",
    image: "/images/addis-office.jpg",
    contact: "+251 11 551 2696",
    beneficiaries: "Supporting over 5,000 children annually",
    programs: [
      "Child Protection",
      "Education Support",
      "Family Strengthening",
      "Youth Empowerment"
    ],
    featured: true
  },
  {
    region: "Oromia",
    city: "Adama",
    address: "Kebele 05, Near Adama University",
    image: "/images/adama-office.jpg",
    contact: "+251 22 111 2345",
    beneficiaries: "Reaching 3,000+ beneficiaries",
    programs: [
      "Community Development",
      "Child Rights Advocacy",
      "Educational Support"
    ],
    featured: true
  },
  {
    region: "Amhara",
    city: "Bahir Dar",
    address: "Belay Zeleke Street, Building 123",
    image: "/images/bahirdar-office.jpg",
    contact: "+251 58 220 1234",
    beneficiaries: "Supporting 2,500 children",
    programs: [
      "Child Protection",
      "Family Support",
      "Education"
    ]
  },
  {
    region: "SNNPR",
    city: "Hawassa",
    address: "Piazza Area, Behind Hawassa University",
    image: "/images/hawassa-office.jpg",
    contact: "+251 46 220 5678",
    beneficiaries: "Serving 2,000+ families",
    programs: [
      "Youth Development",
      "Community Outreach",
      "Child Welfare"
    ]
  },
  {
    region: "Tigray",
    city: "Mekelle",
    address: "Hadnet Sub-City, Near Mekelle University",
    image: "/images/mekelle-office.jpg",
    contact: "+251 34 440 9876",
    beneficiaries: "Reaching 1,800 children",
    programs: [
      "Emergency Response",
      "Child Protection",
      "Education Support"
    ]
  },
  {
    region: "Dire Dawa",
    city: "Dire Dawa",
    address: "Kezira Area, Near Train Station",
    image: "/images/diredawa-office.jpg",
    contact: "+251 25 111 4567",
    beneficiaries: "Supporting 1,500+ children",
    programs: [
      "Child Rights",
      "Community Development",
      "Youth Programs"
    ]
  }
];

export default function WhereWeWorkPage() {
  return (
    <div className="min-h-screen bg-background">
      <CarouselSection />
      
      {/* Map Section */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg">
            <LocationsMap locations={locations} />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-blue-50 rounded-lg">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">6+</h3>
              <p className="text-gray-600">Regional Offices</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">15,000+</h3>
              <p className="text-gray-600">Children Supported</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">20+</h3>
              <p className="text-gray-600">Years of Impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* Office Types Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/where-we-work/city-offices">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-xl shadow-lg cursor-pointer transition-shadow hover:shadow-xl"
              >
                <Building2 className="w-12 h-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold mb-4">City Offices</h2>
                <p className="text-gray-600 mb-6">
                  Our city offices serve as central hubs in major urban areas,
                  providing comprehensive support to children and families in
                  metropolitan regions.
                </p>
                <span className="text-blue-600 font-medium">Learn more →</span>
              </motion.div>
            </Link>

            <Link href="/where-we-work/regional-offices">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-xl shadow-lg cursor-pointer transition-shadow hover:shadow-xl"
              >
                <MapPin className="w-12 h-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold mb-4">Regional Offices</h2>
                <p className="text-gray-600 mb-6">
                  Our regional offices extend our reach across Ethiopia, ensuring we
                  can effectively serve children in every corner of the nation.
                </p>
                <span className="text-blue-600 font-medium">Learn more →</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Locations</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              FSCE operates across Ethiopia through a network of strategically located offices,
              ensuring we can effectively serve children and communities where they need us most.
            </p>
          </div>
          <LocationsGrid locations={locations} />
        </div>
      </section>
    </div>
  );
}
