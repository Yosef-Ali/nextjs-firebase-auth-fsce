'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';
import type { Components } from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
}

function cleanMarkdown(content: string): string {
  return content
    // Replace HTML paragraph tags with double newlines
    .replace(/<p>/g, '\n\n')
    .replace(/<\/p>/g, '')
    // Normalize newlines
    .replace(/\n{3,}/g, '\n\n')
    // Ensure proper spacing for bold text
    .replace(/\*\*([^*]+)\*\*/g, '**$1**')
    // Clean up extra spaces while preserving newlines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

const components: Partial<Components> = {
  h1: ({ children, ...props }) => (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6 text-base text-muted-foreground" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-6 ml-6 list-decimal [&>ol>li]:mt-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-base text-muted-foreground" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-bold text-foreground" {...props}>
      {children}
    </strong>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="mt-6 border-l-2 border-primary/40 pl-6 italic text-muted-foreground" {...props}>
      {children}
    </blockquote>
  ),
};

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const cleanedContent = cleanMarkdown(content);

  return (
    <div className="w-full min-h-[350px] px-4 py-[14px] rounded-md bg-background">
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={components}
          className={cn(
            "relative",
            "text-base text-muted-foreground",
            "[&>*:first-child]:mt-0",
            "[&>*]:mx-0",
          )}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
