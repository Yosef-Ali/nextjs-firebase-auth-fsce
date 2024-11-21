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
  const [error, setError] = useState<Error | string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        console.log('Starting to fetch about data...');
        const data = await whoWeAreService.getAboutContent();
        console.log('Fetched about data:', {
          count: data.length,
          data: data.map(item => ({
            id: item.id,
            title: item.title,
            section: item.section,
            category: item.category,
            published: item.published
          }))
        });
        setAboutData(data);
      } catch (err) {
        console.error('Error in fetchAboutData:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  useEffect(() => {
    console.log('About data state updated:', {
      count: aboutData.length,
      data: aboutData.map(item => ({
        id: item.id,
        title: item.title,
        section: item.section,
        category: item.category,
        published: item.published
      }))
    });
  }, [aboutData]);

  if (loading) {
    return <FSCESkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 font-medium mb-2">
          {error instanceof Error ? 'Error occurred:' : 'Something went wrong:'}
        </div>
        <pre className="mt-2 text-sm bg-red-50 p-4 rounded-md overflow-auto max-w-2xl mx-auto">
          {error instanceof Error ? error.message : error}
        </pre>
      </div>
    );
  }

  if (aboutData.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No about content available. Please check the database for posts with category about and status published.</p>
        <pre className="mt-4 text-sm">
          Looking for:
          - category: about
          - published: true
          - section: vision, mission, or goals
        </pre>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CarouselSection /> 
      <VisionMissionGoals aboutData={aboutData} />
      <FeaturedSection />
       <MapComponent />
      <Partners />
    </div>
  );
}
