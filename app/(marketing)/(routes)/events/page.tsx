'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, ArrowRight } from 'lucide-react';
import FSCESkeleton from '@/components/FSCESkeleton';
import { Post } from '@/app/types/post';
import { formatDate } from '@/lib/utils';
import { postsService } from '@/app/services/posts';
import UpcomingEvents from '@/components/upcoming-events';
import CarouselSection from '@/components/carousel';
import { motion } from 'framer-motion';

// Dummy events data for testing
const dummyEvents: Post[] = [
  {
    id: '1',
    title: 'Annual Charity Gala: Building Dreams Together',
    slug: 'annual-charity-gala-2024',
    excerpt: 'Join us for an evening of inspiration and impact as we celebrate our mission to transform children\'s lives. Featuring special guest speakers, live entertainment, and a silent auction.',
    content: '',
    category: 'Fundraising',
    authorId: 'admin',
    authorEmail: 'admin@fsce.org',
    author: {
      id: 'admin',
      name: 'FSCE Admin',
      email: 'admin@fsce.org',
      avatar: ''
    },
    coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1469&auto=format&fit=crop',
    published: true,
    date: '2024-03-15',
    createdAt: new Date('2024-03-15T00:00:00Z').getTime(),
    updatedAt: new Date('2024-03-15T00:00:00Z').getTime(),
  },
  {
    id: '2',
    title: 'Youth Education Workshop Series',
    slug: 'youth-education-workshop-2024',
    excerpt: 'A comprehensive series of workshops focusing on digital literacy, career development, and life skills for young adults. Open to all FSCE program participants.',
    content: '',
    category: 'Education',
    authorId: 'admin',
    authorEmail: 'admin@fsce.org',
    author: {
      id: 'admin',
      name: 'FSCE Admin',
      email: 'admin@fsce.org',
      avatar: ''
    },
    coverImage: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1470&auto=format&fit=crop',
    published: true,
    date: '2024-03-20',
    createdAt: new Date('2024-03-20T00:00:00Z').getTime(),
    updatedAt: new Date('2024-03-20T00:00:00Z').getTime(),
  },
  {
    id: '3',
    title: 'Community Health Fair 2024',
    slug: 'community-health-fair-2024',
    excerpt: 'Free health screenings, wellness workshops, and family activities. Join us for a day dedicated to promoting health and well-being in our community.',
    content: '',
    category: 'Health',
    authorId: 'admin',
    authorEmail: 'admin@fsce.org',
    author: {
      id: 'admin',
      name: 'FSCE Admin',
      email: 'admin@fsce.org',
      avatar: ''
    },
    coverImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1469&auto=format&fit=crop',
    published: true,
    date: '2024-04-05',
    createdAt: new Date('2024-04-05T00:00:00Z').getTime(),
    updatedAt: new Date('2024-04-05T00:00:00Z').getTime(),
  }
];

export default function EventsPage() {
  const [events, setEvents] = useState<Post[]>([]);
  const [news, setNews] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, newsData] = await Promise.all([
          postsService.getAllEvents(),
          postsService.getLatestNews(3)
        ]);
        // Use dummy events for now
        setEvents(dummyEvents);
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to dummy events on error
        setEvents(dummyEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <FSCESkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <CarouselSection />

      {/* Upcoming Events Section */}
      <UpcomingEvents events={events} showTitle={false} />

      {/* Latest News Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="block group"
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                  {item.coverImage && (
                    <div className="relative w-full pt-[56.25%] overflow-hidden">
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">News</Badge>
                      {item.featured && (
                        <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                          Featured
                        </Badge>
                      )}
                      {item.category && (
                        <Badge variant="outline" className="capitalize">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDate(item.date || item.createdAt)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2">
                      {item.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
