"use client";

import React from 'react';
import { motion } from 'framer-motion';
import EthiopianMap from '../_components/EthiopianMap';
import LocationsGrid from '../_components/LocationsGrid';

const cityOffices = [
  {
    region: "Addis Ababa",
    city: "Addis Ababa",
    address: "Bole Sub-City, Woreda 03, Building No. 345",
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
    region: "Dire Dawa",
    city: "Dire Dawa",
    address: "Kezira Area, Near Train Station",
    contact: "+251 25 111 4567",
    beneficiaries: "Supporting 1,500+ children",
    programs: [
      "Child Rights",
      "Community Development",
      "Youth Programs"
    ]
  }
];

export default function CityOfficesPage() {
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(null);

  const filteredOffices = selectedRegion
    ? cityOffices.filter(office => office.region === selectedRegion)
    : cityOffices;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">City Offices</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our city offices are at the heart of Ethiopia's urban centers, providing crucial
            support and services to children and families in metropolitan areas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">Interactive Map</h2>
            <EthiopianMap
              selectedRegion={selectedRegion}
              onRegionSelect={setSelectedRegion}
              highlightedRegions={cityOffices.map(office => office.region)}
            />
            {selectedRegion && (
              <button
                onClick={() => setSelectedRegion(null)}
                className="mt-4 w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Clear Selection
              </button>
            )}
          </motion.div>

          {/* Statistics and Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-3xl font-bold text-blue-600 mb-2">3+</h3>
                <p className="text-gray-600">City Offices</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-3xl font-bold text-blue-600 mb-2">9,500+</h3>
                <p className="text-gray-600">Urban Children Supported</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Urban Impact</h3>
              <p className="text-gray-600 mb-4">
                Our city offices focus on addressing the unique challenges faced by children
                in urban environments. We work closely with local authorities and communities
                to create lasting positive change.
              </p>
              {selectedRegion && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-600 mb-2">
                    Selected Region: {selectedRegion}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Click on the office below to see detailed information about our
                    work in this city.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Locations Grid */}
        <LocationsGrid locations={filteredOffices} />
      </div>
    </div>
  );
}
