'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Post } from '../services/firebase/marketing';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContentCardProps {
  post: Post;
  showImage?: boolean;
  aspectRatio?: 'portrait' | 'square' | 'video';
  width?: number;
  height?: number;
}

export function ContentCard({
  post,
  showImage = true,
  aspectRatio = "square",
  width = 400,
  height = 400,
}: ContentCardProps) {
  return (
    <Card className="overflow-hidden">
      {showImage && post.images?.[0] && (
        <div className={`relative ${
          aspectRatio === "portrait" ? "aspect-[3/4]" :
          aspectRatio === "square" ? "aspect-square" :
          "aspect-video"
        }`}>
          <Image
            src={post.images[0]}
            alt={post.title}
            fill
            className="object-cover"
            sizes={`(min-width: 1024px) ${width}px, (min-width: 768px) 50vw, 100vw`}
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>{post.excerpt}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="line-clamp-3">
          {typeof post.content === 'string' 
            ? post.content 
            : JSON.stringify(post.content)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={post.author.image} alt={post.author.name} />
            <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{post.author.name}</p>
            <p className="text-muted-foreground">
              {new Date(post.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Link href={`/${post.category}/${post.slug}`}>
          <Button variant="secondary">Read More</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
