"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Award, Shield, Target, Heart, Users, Lightbulb, Scale, Clock, Sparkles, Calendar, ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CarouselSection from "@/components/carousel";
import AchievementsGrid from "@/app/(marketing)/(routes)/who-we-are/achievements/_components/MeritsGrid";
import AchievementsGridSkeleton from './_components/AchievementsGridSkeleton';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Merit } from './_components/Merit';

interface Achievement {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  category: string;
  approved: boolean;
}

const iconComponents = {
  award: Award,
  shield: Shield,
  target: Target,
  heart: Heart,
  users: Users,
  lightbulb: Lightbulb,
  scale: Scale,
  clock: Clock,
  sparkles: Sparkles,
} as const;

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    transition: {
      duration: 0.3
    }
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

export default function AchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [meritsData, setMeritsData] = useState<Merit[]>([]);
  const [awards, setAwards] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch merits
        const meritsRef = collection(db, 'merits');
        const meritsQuery = query(meritsRef, where("approved", "==", true));
        const meritsSnapshot = await getDocs(meritsQuery);
        const meritsData = meritsSnapshot.docs.map(doc => {
          const data = doc.data();
          const IconComponent = data.iconName && iconComponents[data.iconName.toLowerCase() as keyof typeof iconComponents];
          return {
            id: doc.id,
            title: data.title || '', 
            description: data.description || '', 
            ...data,
            icon: IconComponent ? <IconComponent className="h-6 w-6 text-primary" /> : <Sparkles className="h-6 w-6 text-primary" />
          } satisfies Merit;
        });
        setMeritsData(meritsData);

        // Fetch awards
        const awardsRef = collection(db, 'awards');
        const awardsQuery = query(awardsRef, where("approved", "==", true));
        const awardsSnapshot = await getDocs(awardsQuery);
        const awardsData = awardsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Achievement[];
        setAwards(awardsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <CarouselSection />
      <div className="min-h-screen bg-background">
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Our Achievements
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
              Celebrating our impact and milestones in transforming lives and building stronger communities.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10">
                  <CardHeader>
                    <CardTitle>Our Comprehensive Impact</CardTitle>
                    <CardDescription>Key statistics about our presence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h3 className="text-3xl font-bold text-primary mb-2">8+</h3>
                        <p className="text-muted-foreground">Program Offices</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h3 className="text-3xl font-bold text-primary mb-2">20,000+</h3>
                        <p className="text-muted-foreground">Children & Families Supported</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Featured Awards Section */}
            <div className="pb-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((_, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    custom={index}
                    className="h-full"
                  >
                    <Card className="group overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src="/images/placeholder.svg"
                          alt="Achievement"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <div className="text-white">
                            <Badge variant="secondary" className="mb-2 capitalize">
                              Achievement
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center text-sm text-muted-foreground space-x-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>2023</span>
                        </div>

                        <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          Achievement Title
                        </h2>
                        
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          Description of the achievement will go here. This will be populated from the database.
                        </p>

                        <Button variant="link" className="p-0 h-auto font-semibold group/link">
                          Learn More
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/link:translate-x-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Awards Grid Section */}
            <div className="pb-24">
              {loading ? (
                <AchievementsGridSkeleton />
              ) : (
                <AchievementsGrid merits={meritsData} />
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}