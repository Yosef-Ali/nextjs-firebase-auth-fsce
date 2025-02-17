'use client';

export function Loading() {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="w-8 h-8 border-b-2 border-gray-900 rounded-full animate-spin"></div>
    </div>
  );
}