"use client";

import { useEffect, useState, useRef } from "react";
import { whoWeAreService } from "@/app/services/who-we-are";
import { AboutContent } from "@/app/types/about";
import CarouselSection from "@/components/carousel";
import Partners from "@/components/partners";
import EthiopianMap from "@/components/ethiopian-map";
import FSCESkeleton from "@/components/FSCESkeleton";
import FeaturedSection from "@/components/featured-section";
import VisionMissionGoals from "@/components/VisionMissionGoals";

export default function HomePage() {
  const [aboutData, setAboutData] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initialized = useRef(false); // Ref to track initialization

  useEffect(() => {
    let isMounted = true;

    const fetchAboutData = async () => {
      try {
        // Use a one-time query to avoid listener issues
        const data = await whoWeAreService.getAboutContent();

        // Only update state if component is still mounted
        if (isMounted) {
          setAboutData(data);
        }
      } catch (err) {
        console.error("Error in fetchAboutData:", err);
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Only run initialization once, even with Strict Mode
    if (!initialized.current) {
      initialized.current = true;
      fetchAboutData();
    }

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only on initial mount/remount cycle

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
