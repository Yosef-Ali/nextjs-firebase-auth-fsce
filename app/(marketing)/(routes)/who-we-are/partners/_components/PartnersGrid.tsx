"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Partner {
  name: string;
  position: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
  majorSponsor?: boolean;
  link?: string;
}

interface PartnersGridProps {
  partners: Partner[];
}

const PartnersGrid: React.FC<PartnersGridProps> = ({ partners }) => {
  const majorSponsors = partners.filter(partner => partner.majorSponsor);
  const featuredPartners = partners.filter(partner => partner.featured && !partner.majorSponsor);
  const regularPartners = partners.filter(partner => !partner.featured && !partner.majorSponsor);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Major Sponsor Partners */}
        {majorSponsors.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Major Sponsor Partners
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {majorSponsors.map((partner, index) => (
                <Card key={index} className="bg-blue-50/40 hover:bg-blue-50/50 transition-colors rounded-xl shadow-sm p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-white">
                      <Image
                        src={partner.imageUrl}
                        alt={partner.name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="inline-block px-3 py-1 bg-blue-600/90 text-white rounded-full text-sm font-semibold">
                        Major Sponsor Partner
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {partner.name}
                      </h3>
                      <p className="text-gray-600/90">{partner.description}</p>
                      {partner.link && (
                        <Button
                          variant="outline"
                          className="bg-white text-blue-600 hover:bg-blue-50"
                          onClick={() => window.open(partner.link, '_blank')}
                        >
                          Learn More About Our Partnership
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Featured Strategic Partners */}
        {featuredPartners.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Strategic Partners
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPartners.map((partner, index) => (
                <Card key={index} className="bg-blue-50/40 hover:bg-blue-50/50 transition-colors rounded-xl shadow-sm p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-white">
                      <Image
                        src={partner.imageUrl}
                        alt={partner.name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="inline-block px-3 py-1 bg-blue-600/90 text-white rounded-full text-sm font-semibold">
                        Strategic Partner
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {partner.name}
                      </h3>
                      <p className="text-gray-600/90 line-clamp-3">{partner.description}</p>
                      {partner.link && (
                        <Button
                          variant="outline"
                          className="bg-white text-blue-600 hover:bg-blue-50"
                          onClick={() => window.open(partner.link, '_blank')}
                        >
                          Learn More About Our Partnership
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Supporting Partners */}
        {regularPartners.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Supporting Partners
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {regularPartners.map((partner, index) => (
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
