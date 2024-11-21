'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

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

const components = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6 text-base text-muted-foreground">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="my-6 ml-6 list-decimal [&>ol>li]:mt-2">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-base text-muted-foreground">
      {children}
    </li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-bold text-foreground">
      {children}
    </strong>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mt-6 border-l-2 border-primary/40 pl-6 italic text-muted-foreground">
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
