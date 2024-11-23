'use client'

import { useAuth } from '@/app/lib/firebase/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SignUpForm } from '@/app/_components/SignUpForm'
import { Separator } from '@/components/ui/separator'

export default function SignUp() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  useEffect(() => {
    if (!loading && user) {
      router.push(callbackUrl || '/dashboard/posts')
    }
  }, [user, loading, router, callbackUrl])

  const handleSignUp = async () => {
    await signInWithGoogle()
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
          <h1 className="text-4xl font-bold mb-2">Create an Account</h1>
          <p className="text-gray-600 mb-8">Sign up with email or Google</p>
        </div>
        
        <SignUpForm callbackUrl={callbackUrl} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          onClick={handleSignUp}
          className="w-full"
          variant="outline"
        >
          Sign up with Google
        </Button>

        <div className="text-center space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">
              Already have an account?{' '}
            </span>
            <Link 
              href="/sign-in" 
              className="text-sm underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </Link>
          </div>
          <div>
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
