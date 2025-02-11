import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CalendarDays } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ContentCardProps {
    title: string;
    excerpt: string;
    image?: string;
    slug: string;
    category: string;
    createdAt?: number;
    index?: number;
    isFeatured?: boolean;
    showDate?: boolean;
    aspectRatio?: "video" | "square" | "auto";
    layout?: "horizontal" | "vertical";
    imageSize?: "small" | "medium" | "large";
    href: string;
}

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 50,
        transition: {
            duration: 0.3
        }
    },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

export function ContentCard({
    title,
    excerpt,
    image = "/images/placeholder.svg",
    slug,
    category,
    createdAt,
    index = 0,
    isFeatured = false,
    showDate = false,
    aspectRatio = "video",
    layout = "vertical",
    imageSize = "medium",
    href
}: ContentCardProps) {
    const imageStyles = {
        video: "pt-[56.25%]", // 16:9
        square: "pt-[100%]",  // 1:1
        auto: "h-48 md:h-64" // Fixed height
    };

    return (
        <Link href={href} className="block h-full">
            <Card className="group overflow-hidden h-full transition-all duration-300 hover:shadow-lg flex flex-col">
                <div className={`grid ${layout === 'horizontal' ? 'md:grid-cols-3 gap-6' : 'grid-cols-1'}`}>
                    <div className={`relative ${layout === 'horizontal' ? 'md:h-full min-h-[200px]' : 'aspect-[4/3]'} overflow-hidden`}>
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/placeholder.svg";
                            }}
                        />
                        {isFeatured && (
                            <div className="absolute top-4 right-4">
                                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                                    Featured
                                </Badge>
                            </div>
                        )}
                    </div>
                    <div className={`flex flex-col ${layout === 'horizontal' ? 'md:col-span-2 p-6' : ''}`}>
                        <CardHeader className={layout === 'horizontal' ? 'pb-2' : ''}>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary">
                                    {category}
                                </Badge>
                            </div>
                            <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                                {title}
                            </CardTitle>
                            {(showDate && createdAt) && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                    <CalendarDays className="h-4 w-4" />
                                    <time>{formatDate(createdAt)}</time>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className={`flex-grow ${layout === 'horizontal' ? 'pt-2' : ''}`}>
                            <p className="text-muted-foreground line-clamp-3 mb-4">
                                {excerpt}
                            </p>
                            <div className="flex items-center text-primary font-medium group-hover:text-primary/80 transition-colors">
                                Read More
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </CardContent>
                    </div>
                </div>
            </Card>
        </Link>
    );
}