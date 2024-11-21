'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import './styles.css';

interface ContentDisplayProps {
  content: string;
  className?: string;
}

export function ContentDisplay({ content, className }: ContentDisplayProps) {
  return (
    <div 
      className={cn('prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}
