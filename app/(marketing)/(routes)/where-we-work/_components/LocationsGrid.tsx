"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Users, Phone } from 'lucide-react';
import LocationPlaceholder from './LocationPlaceholder';

interface Location {
  region: string;
  city: string;
  address: string;
  image?: string;
  contact: string;
  beneficiaries: string;
  programs: string[];
  featured?: boolean;
}

interface LocationsGridProps {
  locations: Location[];
}

const LocationsGrid: React.FC<LocationsGridProps> = ({ locations }) => {
  // Separate featured locations from others
  const featuredLocations = locations.filter(l => l.featured);
  const otherLocations = locations.filter(l => !l.featured);

  return (
    <div className="space-y-16">
      {/* Featured Locations Section */}
      {featuredLocations.length > 0 && (
        <div className="space-y-8">
          <h3 className="text-2xl font-semibold text-center">Main Offices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredLocations.map((location, index) => (
              <motion.div
                key={location.city}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-xl overflow-hidden"
              >
                <div className="relative h-48 w-full">
                  {location.image ? (
                    <Image
                      src={location.image}
                      alt={`${location.city} office`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <LocationPlaceholder city={location.city} />
                  )}
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold mb-4">
                      {location.region}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{location.city}</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                      <p className="text-gray-700">{location.address}</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-blue-500 mt-1" />
                      <p className="text-gray-700">{location.beneficiaries}</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-blue-500 mt-1" />
                      <p className="text-gray-700">{location.contact}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Programs</h4>
                    <div className="flex flex-wrap gap-2">
                      {location.programs.map((program) => (
                        <span
                          key={program}
                          className="px-3 py-1 bg-white rounded-full text-sm text-blue-600"
                        >
                          {program}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Other Locations Grid */}
      <div>
        <h3 className="text-2xl font-semibold text-center mb-8">Regional Offices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherLocations.map((location, index) => (
            <motion.div
              key={location.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-40 w-full">
                {location.image ? (
                  <Image
                    src={location.image}
                    alt={`${location.city} office`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <LocationPlaceholder city={location.city} />
                )}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">{location.region}</p>
                  <h3 className="text-xl font-semibold text-gray-900">{location.city}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-blue-500 mt-1" />
                    <p className="text-gray-600 text-sm">{location.address}</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="w-4 h-4 text-blue-500 mt-1" />
                    <p className="text-gray-600 text-sm">{location.contact}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {location.programs.slice(0, 2).map((program) => (
                    <span
                      key={program}
                      className="px-2 py-1 bg-blue-50 rounded-full text-xs text-blue-600"
                    >
                      {program}
                    </span>
                  ))}
                  {location.programs.length > 2 && (
                    <span className="px-2 py-1 bg-blue-50 rounded-full text-xs text-blue-600">
                      +{location.programs.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationsGrid;
