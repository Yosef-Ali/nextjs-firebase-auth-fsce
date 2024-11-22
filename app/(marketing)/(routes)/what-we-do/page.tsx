'use client';

import { useEffect, useState } from 'react';
import { whatWeDoService } from '@/app/services/what-we-do';
import { Post } from '@/app/types/post';
import { Program } from '@/app/types/program';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import FSCESkeleton from '@/components/FSCESkeleton';
import Partners from '@/components/partners';
import CarouselSection from '@/components/carousel';

const categories = [
  {
    id: 'prevention-promotion',
    title: 'Prevention & Promotion',
    description: 'Proactive measures to protect children and promote their well-being',
  },
  {
    id: 'protection',
    title: 'Protection',
    description: 'Immediate intervention and support for children at risk',
  },
  {
    id: 'rehabilitation',
    title: 'Rehabilitation',
    description: 'Recovery and reintegration programs for affected children',
  },
  {
    id: 'resource-center',
    title: 'Resource Center',
    description: 'Educational and support facilities for children and communities',
  },
];

export default function WhatWeDoPage() {
  const [programs, setPrograms] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('prevention-promotion');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await whatWeDoService.getAllPrograms();
        setPrograms(data);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  if (loading) {
    return <FSCESkeleton />;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
    <CarouselSection/>
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Our Programs
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Discover how we're making a difference in children's lives through our comprehensive programs and initiatives.
          </p>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="w-full"
                >
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">{category.title}</h2>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>

                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {programs
                    .filter((program) => program.category === category.id)
                    .map((program) => (
                      <motion.div key={program.id} variants={item}>
                        <Card className="h-full flex flex-col">
                          <CardHeader>
                            {program.coverImage && (
                              <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                                <img
                                  src={program.coverImage}
                                  alt={program.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <CardTitle>{program.title}</CardTitle>
                            <CardDescription>{program.excerpt}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            {program.content && (
                              <div className="mb-4">
                                <h4 className="font-semibold mb-2">Overview:</h4>
                                <p className="text-sm text-muted-foreground">
                                  {program.excerpt || program.content.substring(0, 150)}...
                                </p>
                              </div>
                            )}
                            {program.tags && program.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {program.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </CardContent>
                          <div className="p-6 pt-0 mt-auto">
                            <Link href={`/what-we-do/${category.id}/${program.id}`}>
                              <Button className="w-full">
                                Learn More
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </div>
    <Partners/>
    </>
  );
}
