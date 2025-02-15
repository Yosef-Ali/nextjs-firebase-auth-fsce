'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Post } from '@/app/types/post';
import { formatDate } from '@/lib/utils';
import ClientCarousel from './client-carousel';

interface UpcomingEventsProps {
  events: Post[];
  showTitle?: boolean;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, showTitle = true }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No upcoming events at the moment.</p>
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {showTitle && (
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Upcoming Events
          </motion.h2>
        )}

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <ClientCarousel>
              {events.map((event) => (
                <div key={event.id} className="relative w-full aspect-[21/9] md:aspect-[21/9] mt-12">
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    {event.coverImage && (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary" className="bg-primary/20 text-white hover:bg-primary/30">
                        Event
                      </Badge>
                      {event.published && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-200 hover:bg-green-500/30">
                          Published
                        </Badge>
                      )}
                      {event.category && (
                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 capitalize">
                          {typeof event.category === 'string' ? event.category : event.category.name}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold mb-3 line-clamp-1">
                      {event.title}
                    </h3>

                    <div className="flex flex-wrap gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>By {event.authorId || 'Anonymous'}</span>
                      </div>
                    </div>

                    <p className="text-white/80 mb-6 text-sm line-clamp-2 hidden md:block">
                      {event.excerpt}
                    </p>

                    <div className="mb-8">
                      <Link href={`/events/${event.slug}`}>
                        <Button variant="secondary" size="sm" className="gap-1.5">
                          Learn More
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </ClientCarousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
