'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ArrowRight, Star } from 'lucide-react';
import FSCESkeleton from '@/components/FSCESkeleton';
import { Post } from '@/app/types/post';
import { formatDate } from '@/lib/utils';
import { postsService } from '@/app/services/posts';
import { motion } from 'framer-motion';
import { ProgramSearch } from '@/components/program-search';
import CarouselSection from '@/components/carousel';

export default function NewsPage() {
  const [news, setNews] = useState<Post[]>([]);
  const [featuredNews, setFeaturedNews] = useState<Post[]>([]);
  const [events, setEvents] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsData, eventsData] = await Promise.all([
          postsService.getAllNews(),
          postsService.getUpcomingEvents(3)
        ]);
        
        // Separate featured and regular news
        const featured = newsData.filter(post => post.featured);
        const regular = newsData.filter(post => !post.featured);
        
        setFeaturedNews(featured);
        setNews(regular);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredNews = news.filter((newsItem) => 
    searchQuery === '' || 
    newsItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    newsItem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    newsItem.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <FSCESkeleton />;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Carousel Section as Hero */}
      <CarouselSection />

      {/* Hero Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            News & Updates
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Stay updated with the latest news and developments from FSCE. Learn about our impact and ongoing initiatives.
          </p>
          <ProgramSearch 
            onSearch={handleSearch} 
            placeholder="Search news articles..."
            className="mt-10"
          />
        </div>
      </section>

      {/* Featured News Section */}
      {featuredNews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <h2 className="text-3xl font-bold">Featured News</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredNews.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/news/${article.slug}`} className="block group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="grid md:grid-cols-2 gap-4">
                        {article.coverImage && (
                          <div className="relative w-full pt-[75%] md:pt-[100%] overflow-hidden">
                            <Image
                              src={article.coverImage}
                              alt={article.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="bg-yellow-100">Featured</Badge>
                            {article.category && (
                              <Badge variant="outline" className="text-primary">
                                {article.category}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-4">
                            {article.title}
                          </CardTitle>
                          <p className="text-muted-foreground line-clamp-3 mb-4">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatDate(article.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {filteredNews.map((article) => (
              <motion.div key={article.id} variants={item}>
                <Link href={`/news/${article.slug}`} className="block group">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                    {article.coverImage && (
                      <div className="relative w-full pt-[56.25%] overflow-hidden">
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">News</Badge>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center text-primary font-medium group-hover:text-primary/80 transition-colors">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {events.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Upcoming Events</h2>
              <Link href="/events">
                <Button variant="ghost" className="group">
                  View All Events
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
              {events.map((event) => (
                <motion.div key={event.id} variants={item}>
                  <Link href={`/events/${event.slug}`} className="block group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      {event.coverImage && (
                        <div className="relative w-full pt-[56.25%] overflow-hidden">
                          <Image
                            src={event.coverImage}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">Event</Badge>
                          {event.category && (
                            <Badge variant="outline" className="text-primary">
                              {event.category}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {event.title}
                        </CardTitle>
                        <div className="space-y-2 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">
                          {event.excerpt}
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
