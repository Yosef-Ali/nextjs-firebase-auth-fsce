import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { marketingService } from '../../services/firebase/marketing';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContentPageProps {
  params: {
    category: string;
    slug: string;
  };
}

export async function generateMetadata({ params: { category, slug } }: ContentPageProps): Promise<Metadata> {
  const post = await marketingService.getPageContent(slug);

  if (!post) {
    return {
      title: 'Not Found | FSCE',
      description: 'The page you are looking for does not exist.',
    };
  }

  return {
    title: `${post.title} | FSCE`,
    description: post.excerpt,
  };
}

export default async function ContentPage({ params: { category, slug } }: ContentPageProps) {
  const post = await marketingService.getPageContent(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={post.author.image} alt={post.author.name} />
            <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(post.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {post.images?.[0] && (
        <div className="relative aspect-video">
          <Image
            src={post.images[0]}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        {typeof post.content === 'string' 
          ? post.content 
          : JSON.stringify(post.content)}
      </div>

      {post.images?.slice(1).map((image, index) => (
        <div key={index} className="relative aspect-video">
          <Image
            src={image}
            alt={`${post.title} - Image ${index + 2}`}
            fill
            className="object-cover rounded-lg"
            sizes="(min-width: 1024px) 896px, 100vw"
          />
        </div>
      ))}
    </article>
  );
}
