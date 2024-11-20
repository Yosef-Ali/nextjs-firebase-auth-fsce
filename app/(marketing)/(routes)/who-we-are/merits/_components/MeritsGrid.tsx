"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Merit {
  title: string;
  description: string;
  icon: React.ReactNode;
  featured?: boolean;
  longDescription?: string;
}

interface MeritsGridProps {
  merits: Merit[];
}

const MeritsGrid: React.FC<MeritsGridProps> = ({ merits }) => {
  // Separate featured merits from others
  const featuredMerits = merits.filter(m => m.featured);
  const otherMerits = merits.filter(m => !m.featured);

  return (
    <div className="space-y-16">
      {/* Featured Merits Section */}
      {featuredMerits.length > 0 && (
        <div className="space-y-8">
          <h3 className="text-2xl font-semibold text-center">Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredMerits.map((merit, index) => (
              <motion.div
                key={merit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-xl p-8"
              >
                <div className="flex flex-col items-center space-y-6">
                  <div className="p-4 bg-white rounded-full shadow-md">
                    {merit.icon}
                  </div>
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">{merit.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{merit.longDescription || merit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Other Merits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {otherMerits.map((merit, index) => (
          <motion.div
            key={merit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-blue-50 rounded-full">
                {merit.icon}
              </div>
              <h3 className="text-xl font-semibold text-center">{merit.title}</h3>
              <p className="text-gray-500 text-center">{merit.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MeritsGrid;
