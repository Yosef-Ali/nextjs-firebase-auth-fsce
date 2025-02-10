import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface Author {
  name: string;
  email?: string;
  avatar?: string;
}

export interface DetailPageProps {
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  coverImage?: string;
  images?: string[];
  tags?: string[];
  author?: Author;
  relatedPosts?: Array<{
    id: string;
    title: string;
    excerpt?: string;
    category: string;
    coverImage?: string;
    slug: string;
  }>;
}

const formatCategoryName = (category: string) => {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Related Post Card Component
const RelatedPostCard = ({ post }: { post: NonNullable<DetailPageProps["relatedPosts"]>[number] }) => (
  <a href={`/what-we-do/${post.category}/${post.slug}`} className="block h-full">
    <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row h-full">
        <div className="relative w-full sm:w-1/3 aspect-[16/9] sm:aspect-square shrink-0">
          <Image
            src={post.coverImage || "/images/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/placeholder.svg";
            }}
          />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <Badge variant="outline" className="mb-2 w-fit">
            {post.category}
          </Badge>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>
    </Card>
  </a>
);

export default function DetailPageTemplate({
  title,
  excerpt,
  content,
  category,
  coverImage,
  images,
  tags,
  author,
  relatedPosts,
}: DetailPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage: coverImage
            ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${coverImage})`
            : undefined,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 text-white border-white">
              {formatCategoryName(category)}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {title}
            </h1>
            {excerpt && (
              <p className="text-lg text-gray-200 mb-8">{excerpt}</p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Content */}
          <div className="lg:col-span-3">
            <div className="prose prose-lg max-w-none">
              <article className="max-w-none">
                <div className="space-y-4">
                  {/* Images */}
                  {images && images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-video">
                          <Image
                            src={image}
                            alt={`${title} - Image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  {content && content.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="text-muted-foreground">
                        {paragraph.trim()}
                      </p>
                    )
                  ))}
                </div>
              </article>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Category</h3>
              <Badge variant="outline">
                {formatCategoryName(category)}
              </Badge>
            </Card>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Author */}
            {author && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Author</h3>
                <div className="flex items-center gap-4">
                  {author.avatar && (
                    <Avatar>
                      <AvatarImage src={author.avatar} />
                      <AvatarFallback>
                        {author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="font-medium">{author.name}</p>
                    {author.email && (
                      <p className="text-sm text-muted-foreground">
                        {author.email}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="w-full bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Related Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <RelatedPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
