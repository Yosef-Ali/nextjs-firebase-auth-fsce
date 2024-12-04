"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface Partner {
  name: string;
  position: string;
  description: string;
  imageUrl: string;
  link?: string;
}

interface PartnersGridProps {
  partners: Partner[];
}

const PartnersGrid: React.FC<PartnersGridProps> = ({ partners }) => {
  const supportingPartners = partners.filter(partner => partner.position === "Supporting Partner");
  const membershipPartners = partners.filter(partner => partner.position !== "Supporting Partner");

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Supporting Partners */}
        {supportingPartners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {supportingPartners.map((partner, index) => (
              <Link 
                href={partner.link || '#'} 
                key={index}
                className="block transition-transform hover:scale-[1.02]"
              >
                <Card className="bg-blue-50/30 hover:bg-blue-50/40 transition-colors rounded-xl shadow-sm overflow-hidden h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-full bg-white p-4">
                      <div className="relative w-full h-32">
                        <Image
                          src={partner.imageUrl}
                          alt={partner.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div className="p-4 space-y-2 bg-blue-50/50">
                      <h3 className="font-semibold text-lg text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-gray-600/90 font-medium text-center">{partner.position}</p>
                      <p className="text-xs text-gray-500/90 text-center line-clamp-3">{partner.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Membership Partners */}
        {membershipPartners.length > 0 && (
          <div className="space-y-8 pt-8">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Membership Partners
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {membershipPartners.map((partner, index) => (
                <Link 
                  href={partner.link || '#'} 
                  key={index}
                  className="block transition-transform hover:scale-[1.02]"
                >
                  <Card className="bg-blue-50/30 hover:bg-blue-50/40 transition-colors rounded-xl shadow-sm overflow-hidden h-full">
                    <div className="flex flex-col h-full">
                      <div className="w-full bg-white p-4">
                        <div className="relative w-full h-32">
                          <Image
                            src={partner.imageUrl}
                            alt={partner.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div className="p-4 space-y-2 bg-blue-50/50">
                        <h3 className="font-semibold text-lg text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                          {partner.name}
                        </h3>
                        <p className="text-sm text-gray-600/90 font-medium text-center">{partner.position}</p>
                        <p className="text-xs text-gray-500/90 text-center line-clamp-3">{partner.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PartnersGrid;
