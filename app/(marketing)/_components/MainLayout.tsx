'use client';

import React from 'react';
import Navigation from './Navigation';
import Footer from './footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
