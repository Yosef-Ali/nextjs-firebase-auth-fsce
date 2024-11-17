'use client'

import { useAuth } from './hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard/posts')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome to Blog App</h1>
          <p className="text-gray-600 mb-8">Share your thoughts with the world</p>
        </div>
        
        {!user ? (
          <div className="space-y-4">
            <Button
              onClick={signInWithGoogle}
              className="w-full"
            >
              Sign in with Google
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => router.push('/dashboard/posts')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        )}
      </div>
    </main>
  )
}
