"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface Location {
  region: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface LocationsGridProps {
  locations: Location[];
  selectedRegion?: string | null;
}

const LocationsGrid: React.FC<LocationsGridProps> = ({ locations, selectedRegion }) => {
  const filteredLocations = selectedRegion
    ? locations.filter(location => location.region === selectedRegion)
    : locations;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredLocations.map((location, index) => (
        <motion.div
          key={`${location.region}-${location.city}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">{location.city}</h3>
          </div>
          
          <div className="space-y-2 text-gray-600">
            <p className="font-medium">{location.region}</p>
            {location.address && (
              <p className="text-sm">{location.address}</p>
            )}
            {location.phone && (
              <p className="text-sm">
                <span className="font-medium">Phone:</span> {location.phone}
              </p>
            )}
            {location.email && (
              <p className="text-sm">
                <span className="font-medium">Email:</span> {location.email}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LocationsGrid;
