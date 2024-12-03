import React from 'react';
import Image from 'next/image';
import { Award as AwardIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Define Award interface
export interface Award {
  title: string;
  description: string;
  icon?: string | React.ReactNode;
  imageUrl?: string;
  year?: string;
  organization?: string;
  featured?: boolean;
  longDescription?: string;
}

interface AchievementsGridProps {
  awards?: Award[];
}

const AchievementsGrid: React.FC<AchievementsGridProps> = ({ awards }) => {
  return (
    <div className="container mx-auto px-4 w-full">
      {/* Awards Section */}
      {awards && awards.length > 0 && (
        <div>
          <div className="flex items-center justify-center mb-8">
            <AwardIcon className="mr-3 h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-center">Our Achievements</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {awards.map((award, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
                {award.imageUrl && (
                  <div className="relative w-full h-48">
                    <Image 
                      src={award.imageUrl} 
                      alt={award.title} 
                      layout="fill" 
                      objectFit="cover" 
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{award.title}</h3>
                  <p className="text-gray-600 mb-2">{award.description}</p>
                  {award.year && (
                    <p className="text-sm text-gray-500">Year: {award.year}</p>
                  )}
                  {award.organization && (
                    <p className="text-sm text-gray-500">By: {award.organization}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsGrid;
