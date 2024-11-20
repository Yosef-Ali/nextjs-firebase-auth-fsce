"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Partner {
  name: string;
  position: string;
  logo: string;
  bio: string;
}

interface PartnersGridProps {
  partners: Partner[];
}

const PartnersGrid: React.FC<PartnersGridProps> = ({ partners }) => {
  // Separate Kinder Not Hilfe from other partners
  const kinderNotHilfe = partners.find(p => p.name === "Kinder Not Hilfe");
  const otherPartners = partners.filter(p => p.name !== "Kinder Not Hilfe");

  return (
    <div className="space-y-16">
      {/* Featured Partner Section */}
      {kinderNotHilfe && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-xl p-8 max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative w-full h-[300px] md:h-[400px]">
              <Image
                src={kinderNotHilfe.logo}
                alt={`${kinderNotHilfe.name} logo`}
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
                Major Strategic Partner
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{kinderNotHilfe.name}</h2>
              <p className="text-xl text-gray-700 leading-relaxed">{kinderNotHilfe.bio}</p>
              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  onClick={() => window.open('https://www.kindernothilfe.org/', '_blank')}
                >
                  Learn More About Our Partnership
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Other Partners Grid */}
      <div>
        <h3 className="text-2xl font-semibold text-center mb-8">Our Supporting Partners</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPartners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-48 h-48">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-center">{partner.name}</h3>
                <p className="text-gray-600 font-medium text-center">{partner.position}</p>
                <p className="text-gray-500 text-center">{partner.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnersGrid;
