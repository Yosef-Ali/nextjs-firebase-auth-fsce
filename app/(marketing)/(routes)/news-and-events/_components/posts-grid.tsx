import { ReactNode } from 'react';

interface PostsGridProps {
  children: ReactNode;
}

export function PostsGrid({ children }: PostsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {children}
    </div>
  );
}
