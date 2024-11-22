'use client'

import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SignIn() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard/posts')
    }
  }, [user, loading, router])

  const handleSignIn = async () => {
    await signInWithGoogle()
    // The useEffect above will handle the redirect after successful sign-in
  }

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
          <h1 className="text-4xl font-bold mb-2">Sign in to Blog App</h1>
          <p className="text-gray-600 mb-8">Continue with your Google account</p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={handleSignIn}
            className="w-full"
          >
            Sign in with Google
          </Button>
          <div className="text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
