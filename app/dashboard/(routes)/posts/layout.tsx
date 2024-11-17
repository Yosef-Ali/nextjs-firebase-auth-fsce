'use client';

interface PostsLayoutProps {
  children: React.ReactNode;
}

export default function PostsLayout({ children }: PostsLayoutProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {children}
    </div>
  );
}
