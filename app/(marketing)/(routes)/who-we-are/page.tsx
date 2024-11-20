'use client';

import { useEffect, useState } from 'react';
import { whoWeAreService } from '@/app/services/who-we-are';
import { AboutContent } from '@/app/types/about';
import CarouselSection from '@/components/carousel';

import VisionMissionGoals from '@/components/VisionMissionGoals';
import GoodGovernance from '@/components/good-governance';
import Partners from '@/components/partners';
import MapComponent from '@/components/ethiopian-map';
import FSCESkeleton from '@/components/FSCESkeleton';
import FeaturedSection from '@/components/featured-section';


export default function WhoWeArePage() {
  const [aboutData, setAboutData] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const data = await whoWeAreService.getAboutContent();
        setAboutData(data);
      } catch (err) {
        setError('Failed to load content. Please try again later.');
        console.error('Error fetching about data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return <FSCESkeleton />;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (aboutData.length === 0) {
    return (
      <div className="text-center py-8">
        No about content available. Please check the database for posts with category about and status published.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CarouselSection />
      <VisionMissionGoals aboutData={aboutData} />
      <GoodGovernance aboutData={aboutData} />
      <FeaturedSection />
      <MapComponent />
      <Partners />
    </div>
  );
}
