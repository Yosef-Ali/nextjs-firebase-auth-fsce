import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { formatDate } from "@/lib/utils";

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
        scale: 0.95,
        y: 20 
    },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.6,
            ease: [0.215, 0.61, 0.355, 1] // Cubic bezier for smooth animation
        }
    }),
    hover: {
        y: -8,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

export function ContentCard({
    title,
    excerpt,
    image = "/images/placeholder.svg", // Set default placeholder
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
        <Card className="relative h-full overflow-hidden group">
            <div className={`
                h-full transition-all duration-300 ease-out
                bg-card hover:bg-card/95 
                border border-border/50 hover:border-primary/20
                shadow-sm hover:shadow-xl
                ${layout === "horizontal" ? "grid md:grid-cols-2 gap-4" : ""}
            `}>
                <div className={`relative w-full overflow-hidden ${imageStyles[aspectRatio]}`}>
                    <Image
                        src={image || "/images/placeholder.svg"}
                        alt={title}
                        fill
                        className="object-cover transition-all duration-500 ease-out group-hover:scale-110"
                        sizes={imageSize === "large" ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/placeholder.svg";
                        }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {isFeatured && (
                        <div className="absolute top-4 right-4 z-10">
                            <Badge variant="secondary" className="bg-yellow-100/90 backdrop-blur-sm">
                                Featured
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge 
                            variant="outline" 
                            className="transition-colors group-hover:bg-primary/10 group-hover:text-primary"
                        >
                            {category}
                        </Badge>
                    </div>
                    
                    <CardTitle className={`
                        transition-colors duration-300
                        group-hover:text-primary
                        line-clamp-2 
                        ${isFeatured ? "text-2xl mb-4" : "text-xl mb-2"}
                    `}>
                        {title}
                    </CardTitle>

                    {excerpt && (
                        <p className="text-muted-foreground/90 line-clamp-3 mb-4 group-hover:text-muted-foreground">
                            {excerpt}
                        </p>
                    )}

                    <div className="mt-auto space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(createdAt || Date.now())}</span>
                        </div>

                        <div className="flex items-center text-primary font-medium opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            custom={index}
            className="h-full"
        >
            <Link href={href} className="block h-full outline-none focus:ring-2 focus:ring-primary/20 rounded-xl">
                {cardContent}
            </Link>
        </motion.div>
    );
}