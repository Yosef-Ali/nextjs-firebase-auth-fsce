'use client';

import CarouselSection from "@/components/carousel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import FSCESkeleton from "@/components/FSCESkeleton";
import Overview from "@/components/Overview";
import MasonryGrid from "@/components/MasonryGrid";
import YouthEmpowerment from "@/components/YouthEmpowerment";
import Advocacy from "@/components/Advocacy";
import KeyActivity from "@/components/KeyActivities";
import ProgramsSkeleton from "@/components/programSkeleton";



export default function ProgramsPage() {
  const programs = useQuery(api.posts.getPrograms);


  if (programs === undefined) {
    return <ProgramsSkeleton />;
  }

  if (programs.length === 0) {
    return <div className="text-center py-8">{`No programs content available. Please check the database for posts with category 'programs' and status 'published'.`}</div>;
  }
  return (
    <>
      <CarouselSection />
      <Overview data={programs} />
      <MasonryGrid data={programs} />
      <YouthEmpowerment data={programs} />
      <Advocacy data={programs} />
      <KeyActivity data={programs} />
    </>
  );
}