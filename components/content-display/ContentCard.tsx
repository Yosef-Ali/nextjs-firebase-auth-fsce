import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";
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

    const cardContent = (
        <Card className="group overflow-hidden h-full transition-all duration-300 hover:shadow-lg flex flex-col">
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes={imageSize === "large" ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder.svg";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white">
                        <Badge variant="secondary" className="mb-2 capitalize">
                            {category}
                        </Badge>
                    </div>
                </div>
            </div>
            <CardContent className="p-6 flex flex-col flex-grow">
                <div className="space-y-3 flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{formatDate(createdAt || Date.now())}</span>
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {title}
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                        {excerpt}
                    </p>
                </div>
                <div className="pt-4 border-t mt-auto">
                    <Link href={href} className="group/link">
                        <Button
                            variant="ghost"
                            className="w-full justify-between px-0 hover:bg-transparent text-muted-foreground hover:text-primary"
                        >
                            <span className="group-hover/link:underline">Read More</span>
                            <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            className="h-full"
        >
            <Link href={href} className="block h-full">
                {cardContent}
            </Link>
        </motion.div>
    );
}