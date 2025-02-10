'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import FSCESkeleton from '@/components/FSCESkeleton';
import { Post } from '@/app/types/post';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ProgramSearch } from '@/components/program-search';
import CarouselSection from '@/components/carousel';
import { getPosts, getPostsByCategory } from '@/app/actions/posts';

export default function NewsPage() {
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [news, setNews] = useState<Post[]>([]);
  const [featuredNews, setFeaturedNews] = useState<Post[]>([]);
  const [events, setEvents] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch news and recent posts in parallel
        const newsData = await getPostsByCategory('news');
        const eventPosts = await getPosts({ 
          category: 'events',
          limit: 3,
          published: true
        });

        // Split news into featured and regular
        const featured = newsData.filter((post: Post) => post.featured);
        const regular = newsData.filter((post: Post) => !post.featured);

        setFeaturedNews(featured);
        setNews(regular);
        setEvents(eventPosts);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays to prevent undefined errors
        setFeaturedNews([]);
        setNews([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    console.log('Search query updated:', query);
    setSearchQuery(query);
    // Scroll to search results with a small delay to ensure rendering is complete
    setTimeout(() => {
      searchResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const filteredNews = [...featuredNews, ...news].filter((newsItem: Post) =>
    searchQuery === '' ||
    newsItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    newsItem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    newsItem.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <FSCESkeleton />;
  }

  console.log('Filtered news:', filteredNews);
  console.log('Current events section:', events);

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
      <CarouselSection />

      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Latest News & Updates
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Stay informed about our latest initiatives, success stories, and community impact.
          </p>

          <ProgramSearch
            onSearch={handleSearch}
            placeholder="Search news..."
            className="max-w-2xl mx-auto mb-12"
          />
        </div>
      </section>

      <section ref={searchResultsRef} className="py-16 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          {searchQuery && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">
                Search Results {filteredNews.length > 0 ? `(${filteredNews.length})` : ''}
              </h3>
              {filteredNews.length === 0 && (
                <p className="text-muted-foreground">No news found matching "{searchQuery}"</p>
              )}
            </div>
          )}

          {featuredNews.length > 0 && !searchQuery && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <h3 className="text-2xl font-bold">Featured News</h3>
              </div>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {featuredNews.map((post: Post) => (
                  <motion.div key={post.id} variants={item}>
                    <Link href={`/news/${post.slug}`} className="block group">
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                        {post.coverImage && (
                          <div className="relative w-full pt-[56.25%] overflow-hidden">
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">News</Badge>
                            <Badge variant="secondary" className="bg-yellow-100">Featured</Badge>
                          </div>
                          <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-4">
                            {post.title}
                          </CardTitle>
                          <p className="text-muted-foreground line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {news.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {filteredNews.map((post: Post) => (
                <motion.div key={post.id} variants={item}>
                  <Link href={`/news/${post.slug}`} className="block group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      {post.coverImage && (
                        <div className="relative w-full pt-[56.25%] overflow-hidden">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">News</Badge>
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 mb-4">
                          {post.title}
                        </CardTitle>
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'No news found matching your search.' : 'No news available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {events.length > 0 && (
        <section className="py-16 bg-muted/50">
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
              {events.map((event: Post) => (
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
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 mb-4">
                          {event.title}
                        </CardTitle>
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {event.excerpt}
                        </p>
                      </CardHeader>
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
