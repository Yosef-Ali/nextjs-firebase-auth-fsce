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
import { motion, type Variants, type Target } from 'framer-motion';
import { ProgramSearch } from '@/components/program-search';

// Dummy events data for testing
const dummyEvents: Post[] = [
  {
    id: '1',
    title: 'Annual Charity Gala: Building Dreams Together',
    slug: 'annual-charity-gala-2024',
    excerpt: 'Join us for an elegant evening of giving back to the community. Live entertainment, auctions, and inspiring stories of impact.',
    content: '',
    category: { id: 'events', name: 'Events' },
    authorId: 'admin',
    authorEmail: 'admin@fsce.org',
    coverImage: 'https://images.unsplash.com/photo-1511795409834-432f7b1728f2?q=80&w=1469&auto=format&fit=crop',
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
    category: { id: 'education', name: 'Education' },
    authorId: 'admin',
    authorEmail: 'admin@fsce.org',
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
    category: { id: 'health', name: 'Health' },
    authorId: 'admin',
    authorEmail: 'admin@fsce.org',
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, newsData] = await Promise.all([
          postsService.getPublishedPosts('events'),
          postsService.getPublishedPosts('news', 3)
        ]);
        setEvents(eventsData.length > 0 ? eventsData : dummyEvents);
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setEvents(dummyEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filterEvents = () => {
    return events.filter((event) =>
    (searchQuery === '' ||
      event?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event?.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    );
  };

  if (loading) {
    return <FSCESkeleton />;
  }

  const filteredEvents = filterEvents();

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <CarouselSection />

      {/* Upcoming Events Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Upcoming Events
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Join us in our mission. Explore our upcoming and past events that drive change and create impact.
          </p>

          {/* Search Box */}
          <ProgramSearch
            onSearch={handleSearch}
            placeholder="Search events..."
            className="mt-10"
          />
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {filteredEvents.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {filteredEvents.map((event) => (
                <motion.div key={event.id} variants={item} custom={event}>
                  <Link href={`/events/${event.slug}`} className="block group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      {event.coverImage && (
                        <div className="relative w-full pt-[56.25%] overflow-hidden">
                          <Image
                            src={event.coverImage}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">
                            {typeof event.category === 'string'
                              ? event.category
                              : 'object' === typeof event.category && event.category
                                ? event.category.name
                                : 'Event'}
                          </Badge>
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {event.title}
                        </CardTitle>
                        <div className="space-y-2 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {event.excerpt}
                        </p>
                        <div className="flex items-center text-primary font-medium group-hover:text-primary/80 transition-colors">
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No events found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Related News Section */}
      {news.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Latest News</h2>
              <Link href="/news">
                <Button variant="ghost" className="group">
                  View All News
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {news.map((newsItem) => (
                <motion.div key={newsItem.id} variants={item} custom={newsItem}>
                  <Link href={`/news/${newsItem.slug}`} className="block group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      {newsItem.coverImage && (
                        <div className="relative w-full pt-[56.25%] overflow-hidden">
                          <Image
                            src={newsItem.coverImage}
                            alt={newsItem.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">
                            {typeof newsItem.category === 'string'
                              ? newsItem.category
                              : 'object' === typeof newsItem.category && newsItem.category
                                ? newsItem.category.name
                                : 'News'}
                          </Badge>
                          {newsItem.featured && (
                            <Badge variant="secondary" className="bg-yellow-100">Featured</Badge>
                          )}
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                          {newsItem.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatDate(newsItem.date || newsItem.createdAt)}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">
                          {newsItem.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
