import React from 'react';

export function renderContent(content: string): React.ReactNode {
  if (!content) return null;

  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim());

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="mb-4 text-muted-foreground">
      {paragraph}
    </p>
  ));
}
