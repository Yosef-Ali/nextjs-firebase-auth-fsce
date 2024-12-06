'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { getUserData, createUserData } from '@/app/lib/firebase/user-service';

interface SignInFormProps {
  callbackUrl?: string | null;
}

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await signIn(email, password);
      if (currentUser) {
        const userData = await getUserData(currentUser);
        if (!userData) {
          router.push('/pending-approval');
          return;
        }

        switch (userData.status) {
          case 'pending':
            router.push('/pending-approval');
            break;
          case 'suspended':
            router.push('/unauthorized');
            break;
          case 'active':
            if (userData.role === 'admin' || userData.role === 'author') {
              router.push(callbackUrl || '/dashboard/posts');
            } else {
              router.push('/unauthorized');
            }
            break;
          default:
            router.push('/pending-approval');
        }
      }
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithGoogle();
      
      if (!result || !result.userData) {
        toast({
          title: "Error",
          description: "Failed to get user data after sign-in",
          variant: "destructive",
        });
        return;
      }

      const { userData } = result;
      
      // Admin user should always go to dashboard
      if (userData.email === 'dev.yosefali@gmail.com') {
        router.push('/dashboard/posts');
        return;
      }

      // Handle other users based on role and status
      if (userData.role === 'admin' && userData.status === 'active') {
        router.push('/dashboard/posts');
      } else if (userData.status === 'pending') {
        router.push('/pending-approval');
      } else {
        router.push('/unauthorized');
      }
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Sign-in Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <Button className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In with Email'}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
      <p className="px-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/sign-up"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
