import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { Post } from '@/app/types/post';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={post.coverImage || '/images/placeholder.jpg'}
              alt={post.title}
              fill
              className="object-cover"
            />
            <Badge 
              className="absolute top-4 right-4"
              variant={post.category === 'events' ? 'secondary' : 'default'}
            >
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
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
          <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
          <p className="text-muted-foreground line-clamp-3">
            {post.excerpt || post.content}
          </p>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button asChild className="w-full">
            <Link href={`/news-and-events/${post.category}/${post.slug}`}>
              Read More
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
