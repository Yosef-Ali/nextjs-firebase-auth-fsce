import { ReactNode } from 'react';

interface ResourcesGridProps {
  children: ReactNode;
}

export function ResourcesGrid({ children }: ResourcesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {children}
    </div>
  );
}
