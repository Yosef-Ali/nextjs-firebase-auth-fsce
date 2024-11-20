"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface Location {
  region: string;
  city: string;
  coordinates: {
    x: number;
    y: number;
  };
}

interface LocationsMapProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
}

export const LocationsMap: React.FC<LocationsMapProps> = ({ 
  locations,
  onLocationSelect
}) => {
  return (
    <div className="relative w-full aspect-[4/3]">
      <div className="absolute inset-0">
        {locations.map((location, index) => (
          <motion.div
            key={`${location.region}-${location.city}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${location.coordinates.x}%`,
              top: `${location.coordinates.y}%`
            }}
            onClick={() => onLocationSelect?.(location)}
          >
            <MapPin 
              className="w-6 h-6 text-blue-500 hover:text-blue-600 transition-colors"
            />
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
              <span className="text-sm font-medium text-gray-700">
                {location.city}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LocationsMap;
