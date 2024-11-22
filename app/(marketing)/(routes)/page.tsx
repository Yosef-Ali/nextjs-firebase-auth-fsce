'use client';

import { useEffect, useState } from 'react';
import { whoWeAreService } from '@/app/services/who-we-are';
import { AboutContent } from '@/app/types/about';
import CarouselSection from '@/components/carousel';
import Partners from '@/components/partners';
import EthiopianMap from '@/components/ethiopian-map';
import FSCESkeleton from '@/components/FSCESkeleton';
import FeaturedSection from '@/components/featured-section';
import VisionMissionGoals from '@/components/VisionMissionGoals';

export default function HomePage() {
  const [aboutData, setAboutData] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const data = await whoWeAreService.getAboutContent();
        setAboutData(data);
      } catch (err) {
        console.error('Error in fetchAboutData:', err);
        setError(err as Error);
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
    return <div>Error loading content: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <CarouselSection />
      <VisionMissionGoals aboutData={aboutData} />
      <FeaturedSection />
      <EthiopianMap />
      <Partners />
    </div>
  );
}
