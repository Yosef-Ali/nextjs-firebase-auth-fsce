'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { userService } from '@/app/services/firebase/users';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [invitationDetails, setInvitationDetails] = useState<{ email: string; role: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!searchParams) {
      toast({
        title: 'Error',
        description: 'Search parameters are not available.',
        variant: 'destructive',
      });
      router.push('/');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      toast({
        title: 'Invalid Invitation',
        description: 'No invitation token provided.',
        variant: 'destructive',
      });
      router.push('/');
      return;
    }

    const checkInvitation = async () => {
      try {
        const invitation = await userService.checkInvitation(token);
        if (!invitation) {
          toast({
            title: 'Invalid Invitation',
            description: 'This invitation is invalid or has expired.',
            variant: 'destructive',
          });
          router.push('/');
          return;
        }

        setInvitationDetails({
          email: invitation.email,
          role: invitation.role,
        });

        form.setValue('email', invitation.email);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to verify invitation.',
          variant: 'destructive',
        });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkInvitation();
  }, [searchParams, router, toast, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!searchParams) {
      toast({
        title: 'Error',
        description: 'Search parameters are not available.',
        variant: 'destructive',
      });
      return;
    }

    const token = searchParams.get('token');
    if (!token || !invitationDetails) return;

    try {
      setIsLoading(true);
      const success = await userService.acceptInvitation(token, values.email, values.password);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Your account has been created successfully.',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create your account. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create your account.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!invitationDetails) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You have been invited to join FSCE.org as a {invitationDetails.role}.
            Please set up your account to continue.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
