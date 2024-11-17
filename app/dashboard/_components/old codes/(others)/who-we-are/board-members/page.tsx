"use client";

import React from 'react';
import { useQuery } from "convex/react";
import Sidebar from "@/components/Sidebar";
import CarouselSection from "@/components/carousel";
import MapComponent from "@/components/ethiopian-map";

import VisionMissionGoals from '@/components/VisionMissionGoals';
import WhatWeDoSection from '@/components/what-we-do';
import FeaturesSection from '@/components/who-we-are';
import FSCESkeleton from '@/components/FSCESkeleton';
import GoodGovernance from '@/components/good-governance';
import Affiliations from '@/components/affiliations';
import Partners from '@/components/partners';
import BoardMembers from '@/components/BoardMembers';
import { api } from '../../../../../convex/_generated/api';

const members = [
  {
    name: 'John Doe',
    position: 'Chairman',
    image: '/images/profile.webp',
    bio: 'John has over 20 years of experience in leadership and management.',
  },
  {
    name: 'Jane Smith',
    position: 'Vice Chairman',
    image: '/images/profile.webp',
    bio: 'Jane is a seasoned professional with a background in finance and operations.',
  },
  {
    name: 'Emily Johnson',
    position: 'Secretary',
    image: '/images/profile.webp',
    bio: 'Emily has a strong background in administrative support and organizational management.',
  },
  {
    name: 'Michael Brown',
    position: 'Treasurer',
    image: '/images/profile.webp',
    bio: 'Michael is an expert in financial planning and analysis with over 15 years of experience.',
  },
  {
    name: 'Sarah Davis',
    position: 'Board Member',
    image: '/images/profile.webp',
    bio: 'Sarah brings a wealth of knowledge in marketing and communications.',
  },
  {
    name: 'David Wilson',
    position: 'Board Member',
    image: '/images/profile.webp',
    bio: 'David has extensive experience in strategic planning and business development.',
  },
];

export default function AboutPage() {
  const about = useQuery(api.posts.getAbout);

  console.log("Client: About data:", about);

  if (about === undefined) {
    return <FSCESkeleton />;
  }

  if (about.length === 0) {
    return <div className="text-center py-8">{`No about content available. Please check the database for posts with category 'about' and status 'published'.`}</div>;
  }

  return (
    <>
      <CarouselSection />
      <BoardMembers members={members} />
      <Partners />
    </>
  );
}