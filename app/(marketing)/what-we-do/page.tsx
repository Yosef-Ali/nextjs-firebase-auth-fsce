import { Metadata } from 'next';
import { marketingService } from '../services/firebase/marketing';
import { ContentCard } from '../_components/ContentCard';

export const metadata: Metadata = {
  title: 'What We Do | FSCE',
  description: 'Learn about our programs and initiatives at FSCE',
};

export default async function WhatWeDoPage() {
  const content = await marketingService.getWhatWeDo();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">What We Do</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Discover our programs and initiatives that make a difference
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            aspectRatio="video"
          />
        ))}
      </div>
    </div>
  );
}
