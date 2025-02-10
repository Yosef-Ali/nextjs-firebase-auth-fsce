'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { handleAuthError } from '@/app/lib/auth-errors';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/app/types/user';

interface SignInFormProps {
  callbackUrl?: string;
}

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email) throw new Error('Please enter your email');
      if (!password) throw new Error('Please enter your password');

      const userData = await signIn(email, password);
      if (userData.role === UserRole.ADMIN || userData.role === UserRole.AUTHOR) {
        router.push(callbackUrl || '/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: unknown) {
      const authError = handleAuthError(error);
      toast({
        title: "Sign in failed",
        description: authError.message,
        variant: "destructive",
      });

      if (authError.code === 'auth/wrong-password') {
        setPassword('');
      }
      if (authError.code === 'auth/user-not-found') {
        setEmail('');
        setPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { userData } = await signInWithGoogle();

      // Check if user has appropriate role for dashboard access
      if (userData.role === UserRole.ADMIN || userData.role === UserRole.AUTHOR) {
        router.push(callbackUrl || '/dashboard');
      } else {
        toast({
          title: "Access Restricted",
          description: "You don't have permission to access the dashboard.",
          variant: "destructive",
        });
        router.push('/');
      }
    } catch (error: unknown) {
      const authError = handleAuthError(error);
      toast({
        title: "Google sign in failed",
        description: authError.message,
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
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
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
      <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleSignIn}>
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Signing in...
          </>
        ) : (
          'Google'
        )}
      </Button>
    </div>
  );
}
