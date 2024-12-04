'use client';

import { useEffect, useState } from 'react';
import { whatWeDoService } from '@/app/services/what-we-do';
import { Post } from '@/app/types/post';
import { Program } from '@/app/types/program';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Loader2, CalendarDays } from 'lucide-react';
import FSCESkeleton from '@/components/FSCESkeleton';
import Partners from '@/components/partners';
import CarouselSection from '@/components/carousel';
import { ProgramSearch } from '@/components/program-search';

const categories = [
  {
    id: 'child-protection',
    title: 'Child Protection',
    description: 'Comprehensive programs to ensure the safety and well-being of children',
  },
  {
    id: 'youth-empowerment',
    title: 'Youth Empowerment',
    description: 'Programs and initiatives to empower youth for a better future',
  },
  {
    id: 'advocacy',
    title: 'Advocacy',
    description: 'Speaking up and taking action for children's rights and needs',
  },
  {
    id: 'humanitarian-response',
    title: 'Humanitarian Response',
    description: 'Providing critical support and assistance in times of crisis',
  },
];

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

export default function WhatWeDoPage() {
  const [programs, setPrograms] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('child-protection');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filterPrograms = (category: string) => {
    return programs
      .filter((program) => program.category === category)
      .filter((program) => 
        searchQuery === '' || 
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  if (loading) {
    return <FSCESkeleton />;
  }

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
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Discover how we're making a difference in children's lives through our comprehensive programs and initiatives.
          </p>
          
          {/* Search Box */}
          <ProgramSearch 
            onSearch={handleSearch} 
            className="mt-10"
          />
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
                  {filterPrograms(category.id).map((program) => (
                    <motion.div key={program.id} variants={item}>
                      <Link href={`/what-we-do/${category.id}/${program.id}`} className="block group">
                        <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                          {program.coverImage && (
                            <div className="relative w-full pt-[56.25%] overflow-hidden">
                              <img
                                src={program.coverImage}
                                alt={program.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <CardHeader>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary">Programs</Badge>
                              <Badge variant="outline" className="text-primary">
                                {category.title}
                              </Badge>
                            </div>
                            <CardTitle className="group-hover:text-primary transition-colors">
                              {program.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                              <CalendarDays className="h-4 w-4" />
                              <span>{program.createdAt ? new Date(program.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 'Ongoing'}</span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground line-clamp-2 mb-4">
                              {program.excerpt || program.content?.substring(0, 150)}
                            </p>
                            <div className="flex items-center text-primary font-medium">
                              Read More
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
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
