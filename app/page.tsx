'use client'

import { useAuth } from './hooks/useAuth'
import Image from "next/image";
import Link from 'next/link';
import Navigation from './components/Navigation';

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-6 md:p-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to Auth App
          </h1>
          <p className="text-xl text-muted-foreground">
            A secure authentication system built with Next.js and Firebase
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/sign-in"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Get Started
            </Link>
            <a
              href="https://github.com/yourusername/nextjs-firebase-auth-app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
