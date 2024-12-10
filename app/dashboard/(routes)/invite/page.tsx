'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usersService } from '@/app/services/users';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export default function InvitePage() {
  const params = useSearchParams()!;
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const token = params.get('token');
  const email = params.get('email');

  useEffect(() => {
    // Validate invitation parameters
    if (!token || !email) {
      toast({
        title: 'Invalid Invitation',
        description: 'Missing invitation token or email',
        variant: 'destructive',
      });
    }
  }, [token, email]);

  const handleAcceptInvitation = async () => {
    if (!token || !email) {
      toast({
        title: 'Error',
        description: 'Invalid invitation',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const success = await usersService.acceptAuthorInvitation(email, token);
      
      if (success) {
        toast({
          title: 'Invitation Accepted',
          description: 'You are now an author!',
        });
        // Redirect to dashboard or author page
        router.push('/dashboard');
      } else {
        toast({
          title: 'Invitation Failed',
          description: 'Could not accept invitation. Please contact admin.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to process invitation',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Author Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You have been invited to become an author.</p>
          
          {email && (
            <div>
              <strong>Invitation Email:</strong> {email}
            </div>
          )}
          
          <Button 
            onClick={handleAcceptInvitation} 
            disabled={isProcessing || !token || !email}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Accept Invitation'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
