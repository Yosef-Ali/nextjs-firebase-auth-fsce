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

export default function EventsPage() {
  const [events, setEvents] = useState<Post[]>([]);
  const [news, setNews] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, newsData] = await Promise.all([
          postsService.getAllEvents(),
          postsService.getLatestNews(3) // Get latest 3 news items
        ]);
        setEvents(eventsData);
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching data:', error);
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
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Events & News
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Stay updated with FSCE's latest events and news. Join us in making a difference in children's lives.
          </p>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
          {events.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No upcoming events at the moment.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block group"
                >
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
                        {event.featured && (
                          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                            Featured
                          </Badge>
                        )}
                        {event.category && (
                          <Badge variant="outline" className="capitalize">
                            {event.category}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {event.title}
                      </CardTitle>
                      <div className="space-y-2 mt-3 text-sm text-muted-foreground">
                        {event.date && (
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                        )}
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
                      <p className="text-muted-foreground line-clamp-3">
                        {event.excerpt || event.content}
                      </p>
                      <Button variant="link" className="mt-4 p-0 h-auto font-semibold group">
                        Learn More
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest News</h2>
            <Link href="/news">
              <Button variant="outline">
                View All News
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {news.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No news articles available.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="block group"
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                    {article.coverImage && (
                      <div className="relative w-full pt-[56.25%] overflow-hidden">
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">News</Badge>
                        {article.category && (
                          <Badge variant="outline" className="text-primary">
                            {article.category}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      {article.createdAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="mt-4 flex items-center text-primary font-medium group-hover:text-primary/80 transition-colors">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
