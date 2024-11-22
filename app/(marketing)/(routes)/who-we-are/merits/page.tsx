"use client";

import React, { useState, useEffect } from 'react';
import { Award, Shield, Target, Heart, Users, Lightbulb, Scale, Clock, Sparkles } from "lucide-react";
import CarouselSection from "@/components/carousel";
import MeritsGrid from './_components/MeritsGrid';
import MeritsGridSkeleton from './_components/MeritsGridSkeleton';

const meritsData = [
  {
    title: "Child-Centered Approach",
    description: "Putting children's needs and rights at the heart of everything we do.",
    longDescription: "Our organization is built on the fundamental belief that every child deserves the best possible start in life. We ensure that children's voices are heard and their needs are prioritized in all our programs and decisions.",
    icon: "Heart",
    featured: true
  },
  {
    title: "Community Empowerment",
    description: "Building stronger communities through collaborative partnerships and local engagement.",
    longDescription: "We believe in the power of community-driven change. By working hand in hand with local communities, we create sustainable solutions that address the root causes of challenges facing children and families.",
    icon: "Users",
    featured: true
  },
  {
    title: "Excellence",
    description: "Committed to delivering outstanding results and maintaining the highest standards in everything we do.",
    icon: "Award"
  },
  {
    title: "Integrity",
    description: "Building trust through honest practices and transparent communication with all stakeholders.",
    icon: "Shield"
  },
  {
    title: "Innovation",
    description: "Continuously pushing boundaries and embracing new ideas to stay ahead in a dynamic environment.",
    icon: "Lightbulb"
  },
  {
    title: "Accountability",
    description: "Taking responsibility for our actions and being transparent in our operations and decision-making.",
    icon: "Scale"
  },
  {
    title: "Sustainability",
    description: "Creating lasting positive change through environmentally and socially responsible practices.",
    icon: "Target"
  },
  {
    title: "Timeliness",
    description: "Responding promptly to needs and delivering solutions efficiently and effectively.",
    icon: "Clock"
  },
  {
    title: "Quality",
    description: "Maintaining high standards in all our programs and services to ensure the best outcomes.",
    icon: "Sparkles"
  }
];

const awards = [
  {
    title: "IOM Excellence Award",
    description: "Awarded for outstanding service to returnee migrants and communities. Recognized by IOM Ethiopia Chief of Mission, Abibatou Wane-Fall.",
    imageUrl: "/images/photo_2024-10-17%2021.05.38.jpeg",
    year: "April 2023",
    organization: "International Organization for Migration (IOM)"
  },
  {
    title: "UPSNP Outstanding Performance Award",
    description: "Recognized for outstanding project performance and commitment in rehabilitation and reintegration of urban destitutes under the Urban Productive Safety Net Project (UPSNP).",
    imageUrl: "/images/photo_2024-10-17%2021.05.50.jpeg",
    year: "2023",
    organization: "Addis Ababa City Government Bureau of Women, Children & Social Affairs"
  }
];

export default function MeritsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CarouselSection />
      <div className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Values & Achievements</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our commitment to excellence and impact in child welfare is reflected in our core values
            and recognized through prestigious awards from national and international organizations.
          </p>
        </div>
        {loading ? (
          <MeritsGridSkeleton />
        ) : (
          <MeritsGrid merits={meritsData} awards={awards} />
        )}
      </div>
    </div>
  );
}