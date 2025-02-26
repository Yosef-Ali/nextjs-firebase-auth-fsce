'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import FSCESkeleton from '@/components/FSCESkeleton';
import { Post } from '@/app/types/post';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/app/utils/date';
import { postsService } from '@/app/services/posts';
import { motion } from 'framer-motion';

export default function AchievementDetailPage() {
    const [post, setPost] = useState<Post | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams<{ slug: string }>();

    useEffect(() => {
        const fetchData = async () => {
            if (!params?.slug) {
                setError('Invalid URL parameters');
                setLoading(false);
                return;
            }

            try {
                const slug = typeof params.slug === 'string' ? params.slug : params.slug[0];
                const postData = await postsService.getPostBySlug(slug);

                if (!postData) {
                    setError('Achievement not found');
                    setLoading(false);
                    return;
                }

                setPost(postData);

                // Fetch related achievements
                const related = await postsService.getRelatedPosts(
                    slug,
                    'achievements',
                    3
                );
                setRelatedPosts(related);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load achievement details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params]);

    if (loading) {
        return <FSCESkeleton />;
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-background py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold mb-4">Achievement Not Found</h1>
                    <p className="text-muted-foreground mb-8">{error || "The achievement you're looking for doesn't exist."}</p>
                    <Button asChild>
                        <Link href="/who-we-are/achievements">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Achievements
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="py-20 bg-primary/5">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Button
                            variant="ghost"
                            className="mb-6 hover:bg-transparent hover:text-primary"
                            asChild
                        >
                            <Link href="/who-we-are/achievements">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Achievements
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary">Achievement</Badge>
                            {post.category && (
                                <Badge variant="outline" className="text-primary">
                                    {typeof post.category === 'string' ? post.category : post.category.name}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
                        {post.createdAt && (
                            <p className="text-muted-foreground">
                                Published on {formatDate(post.createdAt.toDate())}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {post.coverImage && (
                            <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
                                <Image
                                    src={post.coverImage}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    unoptimized={post.coverImage.startsWith('data:')}
                                />
                            </div>
                        )}
                        <div className="prose prose-lg max-w-none">
                            {post.content && (
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Achievements */}
            {relatedPosts.length > 0 && (
                <section className="py-16 bg-muted/50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold mb-8">Related Achievements</h2>
                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {relatedPosts.map((relatedPost) => (
                                <motion.div
                                    key={relatedPost.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        show: { opacity: 1, y: 0 }
                                    }}
                                >
                                    <Link href={`/who-we-are/achievements/${relatedPost.slug}`} className="block group">
                                        <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                                            {relatedPost.coverImage && (
                                                <div className="relative w-full pt-[56.25%] overflow-hidden">
                                                    <Image
                                                        src={relatedPost.coverImage}
                                                        alt={relatedPost.title}
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                        unoptimized={relatedPost.coverImage.startsWith('data:')}
                                                    />
                                                </div>
                                            )}
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Badge variant="secondary">Achievement</Badge>
                                                </div>
                                                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                                    {relatedPost.title}
                                                </h3>
                                                {relatedPost.excerpt && (
                                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                                        {relatedPost.excerpt}
                                                    </p>
                                                )}
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
