'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { AboutContent } from '@/app/types/about';
import { useAuth } from '@/app/providers/AuthProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Authorization, UserRole } from '@/app/lib/authorization';

interface AboutSectionFormProps {
  initialData?: AboutContent;
  section: 'vision' | 'mission' | 'values';
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
  const { user, loading: authLoading } = useAuth();

  // If authentication is still loading, show a loading indicator
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine user's authorization context
  const authContext = Authorization.createContext(
    user, 
    initialData?.createdBy // Pass the original creator's ID
  );

  const sectionDetails = {
    vision: {
      title: 'Our Vision',
      placeholder: "Describe your organization's long-term vision and aspirations...",
      hint: "State your organization's aspirational future and long-term impact."
    },
    mission: {
      title: 'Our Mission',
      placeholder: "Explain your organization's purpose and how you achieve your goals...",
      hint: "Define your organization's purpose and how you work to achieve it."
    },
    values: {
      title: 'Our Values',
      placeholder: "List your organization's core values and principles...",
      hint: "List the core principles that guide your organization's actions and decisions."
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      // Check authorization
      if (!Authorization.canAccess(authContext, UserRole.USER)) {
        throw new Error('Unauthorized: You do not have permission to modify this content.');
      }

      const docRef = initialData?.id 
        ? doc(db, 'about', initialData.id)
        : doc(collection(db, 'about'));

      await setDoc(docRef, {
        title: sectionDetails[section].title,
        content,
        section,
        category: 'about',
        published: true,
        createdBy: initialData?.createdBy || user?.uid,
        updatedBy: user?.uid,
        updatedAt: Timestamp.now(),
        ...(initialData ? {} : { 
          createdAt: Timestamp.now(),
          createdBy: user?.uid 
        })
      }, { merge: true });

      toast({
        title: 'Success',
        description: `${sectionDetails[section].title} has been ${initialData ? 'updated' : 'created'} successfully.`,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error saving content:', error);
      setAuthError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while saving the content. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // If not authorized, show a restricted access message
  if (!Authorization.canAccess(authContext, UserRole.USER)) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            {Authorization.isAdmin(user) 
              ? 'Unable to verify admin credentials.' 
              : 'You do not have permission to modify this content. Only administrators or original creators can edit.'}
          </AlertDescription>
        </Alert>

        {/* Disable form inputs to prevent any interaction */}
        <div className="opacity-50 pointer-events-none">
          <Textarea
            placeholder={sectionDetails[section].placeholder}
            value={content}
            onChange={() => {}}
            className="min-h-[200px] resize-none"
            disabled
          />
          <p className="text-sm text-muted-foreground mt-2">
            {sectionDetails[section].hint}
          </p>
        </div>

        <Button 
          variant="outline" 
          disabled 
          className="w-full"
        >
          Access Denied
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authorization Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Textarea
          placeholder={sectionDetails[section].placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] resize-none"
          required
        />
        <p className="text-sm text-muted-foreground">
          {sectionDetails[section].hint}
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (initialData ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
}
