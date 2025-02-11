import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { Post } from '@/app/types/post';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HorizontalPostCardProps {
    post: Post;
    href: string;
}

export function HorizontalPostCard({ post, href }: HorizontalPostCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full"
        >
            <Link href={href} className="block h-full group">
                <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="grid md:grid-cols-12 gap-0 h-full">
                        <div className="md:col-span-5 lg:col-span-4 relative">
                            <div className="relative w-full h-full min-h-[240px] md:min-h-full overflow-hidden">
                                <Image
                                    src={post.coverImage || "/images/placeholder.svg"}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-all duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/images/placeholder.svg";
                                    }}
                                    loading="lazy"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </div>
                        <div className="md:col-span-7 lg:col-span-8 p-6 md:p-8 flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                    {typeof post.category === 'string' ? post.category : post.category?.name}
                                </Badge>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-3 mb-6 flex-grow">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays className="h-4 w-4 text-primary/70" />
                                    <time>{formatDate(post.createdAt)}</time>
                                </div>
                                <div className="flex items-center text-primary font-medium group-hover:text-primary transition-colors">
                                    Read More
                                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
}