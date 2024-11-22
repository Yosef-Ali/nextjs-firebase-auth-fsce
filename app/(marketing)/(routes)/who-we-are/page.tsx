'use client';

import { useEffect, useState } from 'react';
import { whoWeAreService } from '@/app/services/who-we-are';
import { AboutContent } from '@/app/types/about';
import VisionMissionGoals from '@/components/VisionMissionGoals';
import FSCESkeleton from '@/components/FSCESkeleton';
import SectionHeader from '@/components/section-header';

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
        console.error('Error fetching about data:', err);
        setError(err instanceof Error ? err : 'Failed to load content');
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
    return (
      <div className="text-center py-8 text-red-500">
        {error instanceof Error ? error.message : error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16 py-12">
      <SectionHeader
        title="Who We Are"
        description="Learn about our organization, our mission, and our commitment to child welfare and empowerment."
      />
      
      <VisionMissionGoals aboutData={aboutData} />
    </div>
  );
}
