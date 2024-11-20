"use client";

import React from 'react';
import { motion } from 'framer-motion';
import EthiopianMap from '../_components/EthiopianMap';
import LocationsGrid from '../_components/LocationsGrid';

const regionalOffices = [
  {
    region: "Amhara",
    city: "Bahir Dar",
    address: "Belay Zeleke Street, Building 123",
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
    contact: "+251 34 440 9876",
    beneficiaries: "Reaching 1,800 children",
    programs: [
      "Emergency Response",
      "Child Protection",
      "Education Support"
    ]
  }
];

export default function RegionalOfficesPage() {
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(null);

  const filteredOffices = selectedRegion
    ? regionalOffices.filter(office => office.region === selectedRegion)
    : regionalOffices;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Regional Offices</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our regional offices serve as vital hubs for FSCE's work across Ethiopia,
            ensuring we can effectively reach and support children in every corner of the nation.
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
              highlightedRegions={regionalOffices.map(office => office.region)}
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
                <p className="text-gray-600">Regional Offices</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-3xl font-bold text-blue-600 mb-2">6,300+</h3>
                <p className="text-gray-600">Children Supported</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Regional Impact</h3>
              <p className="text-gray-600 mb-4">
                Our regional offices are strategically located to maximize our reach
                and impact across Ethiopia. Each office is equipped to provide comprehensive
                support and implement our core programs effectively.
              </p>
              {selectedRegion && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-600 mb-2">
                    Selected Region: {selectedRegion}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Click on the office below to see detailed information about our
                    work in this region.
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
