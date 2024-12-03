import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Award, Shield, Target, Heart, Users, Lightbulb, Scale, Clock, Sparkles } from "lucide-react";
import Image from "next/image";
import { postsService } from "@/app/services/posts";
import { Post } from "@/app/types/post";
import { Merit } from './Merit';

interface Award {
  title: string;
  organization: string;
  description: string;
  imageUrl: string;
  year: string;
}

interface AchievementsGridProps {
  merits: Merit[];
  awards?: Award[];
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

const AchievementsGrid: React.FC<AchievementsGridProps> = ({ merits, awards: initialAwards }) => {
  const [awards, setAwards] = useState<Award[]>(initialAwards || []);
  const [loading, setLoading] = useState(!initialAwards);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const publishedAwards = await postsService.getPublishedPosts('merits');
        const transformedAwards: Award[] = publishedAwards.map(post => ({
          title: post.title,
          organization: post.section || '',
          description: post.excerpt || '',
          imageUrl: post.coverImage || '',
          year: post.time || new Date(post.createdAt).getFullYear().toString(),
        }));
        setAwards(transformedAwards);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialAwards) {
      fetchAwards();
    }
  }, [initialAwards]);

  const featuredMerits = merits.filter(merit => merit.featured);
  const otherMerits = merits.filter(merit => !merit.featured);

  const IconComponent = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap];
    return Icon ? <Icon className="h-6 w-6 text-primary" /> : null;
  };

  if (loading) {
    return <div className="text-center py-12">Loading achievements...</div>;
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto space-y-16">
        {/* Awards Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Awards & Recognition
          </h2>
          {awards.length === 0 ? (
            <div className="text-center text-gray-500">No achievements found</div>
          ) : (
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
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {award.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AchievementsGrid;
