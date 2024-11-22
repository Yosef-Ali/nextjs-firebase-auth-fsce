import React from 'react';
import { Card } from "@/components/ui/card";
import { Award, Shield, Target, Heart, Users, Lightbulb, Scale, Clock, Sparkles } from "lucide-react";
import Image from "next/image";

interface Merit {
  icon: string;
  title: string;
  description: string;
  featured?: boolean;
  longDescription?: string;
}

interface Award {
  title: string;
  organization: string;
  description: string;
  imageUrl: string;
  year: string;
}

interface MeritsGridProps {
  merits: Merit[];
  awards: Award[];
}

const iconMap = {
  Award,
  Shield,
  Target,
  Heart,
  Users,
  Lightbulb,
  Scale,
  Clock,
  Sparkles,
};

const MeritsGrid: React.FC<MeritsGridProps> = ({ merits, awards }) => {
  const featuredMerits = merits.filter(merit => merit.featured);
  const otherMerits = merits.filter(merit => !merit.featured);

  const IconComponent = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap];
    return Icon ? <Icon className="w-12 h-12 text-blue-600/80" /> : null;
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto space-y-16">
        {/* Featured Merits */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredMerits.map((merit, index) => (
              <Card key={index} className="bg-blue-50/40 hover:bg-blue-50/50 transition-colors rounded-xl shadow-sm p-8">
                <div className="flex flex-col items-center space-y-6">
                  <div className="p-4 bg-white rounded-full shadow-md">
                    {IconComponent(merit.icon)}
                  </div>
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {merit.title}
                    </h3>
                    <p className="text-gray-600/90">{merit.longDescription || merit.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Awards Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Awards & Recognition
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {awards.map((award, index) => (
              <Card key={index} className="bg-blue-50/30 hover:bg-blue-50/40 transition-colors rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-col">
                  <div className="relative w-full h-48 bg-white p-4">
                    <Image
                      src={award.imageUrl}
                      alt={award.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="p-4 space-y-3 bg-gradient-to-b from-blue-50/50 to-blue-100/30">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-blue-600/80 font-medium">{award.organization}</p>
                      <span className="text-sm text-blue-600/80">{award.year}</span>
                    </div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent line-clamp-2">
                      {award.title}
                    </h3>
                    <p className="text-sm text-gray-600/90 line-clamp-3">{award.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Other Merits Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Additional Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherMerits.map((merit, index) => (
              <Card key={index} className="bg-blue-50/30 hover:bg-blue-50/40 transition-colors rounded-lg shadow-sm p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-white rounded-full shadow-md">
                    {IconComponent(merit.icon)}
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {merit.title}
                  </h3>
                  <p className="text-sm text-gray-600/90 text-center">{merit.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeritsGrid;
