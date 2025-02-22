'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { AboutContent } from '@/app/types/about';
import { useAuthContext } from '@/app/lib/firebase/context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Authorization } from '@/app/lib/authorization';
import { UserRole } from '@/app/types/user';

interface AboutSectionFormProps {
  initialData: AboutContent | null;
  section: string;
  onSuccess?: () => void;
}

export default function AboutSectionForm({
  initialData,
  section,
  onSuccess
}: AboutSectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const [content, setContent] = useState(initialData?.content || '');
  const { user, userData, loading: authLoading } = useAuthContext();

  // If authentication is still loading, show a loading indicator
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Create auth context
  const authContext = Authorization.createContext(user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      // Check authorization
      if (!Authorization.getInstance().hasRole(userData, UserRole.ADMIN)) {
        throw new Error('Unauthorized: Admin access required');
      }

      const aboutRef = doc(collection(db, 'about'), section);
      await setDoc(aboutRef, {
        content,
        updatedAt: Timestamp.now(),
        updatedBy: user?.uid
      }, { merge: true });

      toast({
        title: 'Success',
        description: 'Content updated successfully',
      });

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update content';
      setAuthError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter content..."
        className="min-h-[200px]"
      />

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
