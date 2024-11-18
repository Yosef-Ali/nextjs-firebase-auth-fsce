import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { Post } from '@/app/types/post';
import { motion } from 'framer-motion';

interface FeaturedPostProps {
  post: Post;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-lg overflow-hidden"
    >
      <div className="relative h-[500px] w-full">
        <Image
          src={post.coverImage || '/images/placeholder.jpg'}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-4">
            <Badge 
              className="bg-primary hover:bg-primary/90"
              variant="secondary"
            >
              Featured
            </Badge>
            <Badge 
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </Badge>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h2>
          
          <div className="flex items-center gap-4 text-sm text-white/80 mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(post.createdAt, 'MMM d, yyyy')}</span>
            </div>
            {post.category === 'events' && post.eventDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{format(post.eventDate, 'h:mm a')}</span>
              </div>
            )}
          </div>

          <p className="text-white/90 mb-6 line-clamp-2 text-lg">
            {post.excerpt || post.content}
          </p>

          <Button asChild size="lg" variant="secondary">
            <Link href={`/news-and-events/${post.category}/${post.slug}`}>
              Read More
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
