'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AboutContent } from '@/app/types/about';
import { useAuth } from '@/app/providers/AuthProvider';
import { AppUser } from '@/app/types/user';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Authorization, authorization } from '@/lib/authorization'; // Import both class and instance
import { UserRole } from '@/lib/authorization';
import { User } from 'firebase/auth';
import { User as AppUserType } from '@/app/types/user';

// Add this interface to merge AppUser and Firebase User types
interface MergedUser extends Omit<User, keyof AppUser>, AppUser { }

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
  const { user, loading: authLoading } = useAuth() as { user: AppUser | null; loading: boolean };

  // State for authorization results
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);

  // Perform authorization check asynchronously
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!authLoading) {
        // Construct the Firebase User object expected by the Authorization class
        // This might need adjustment based on your actual AppUser structure
        const firebaseUser = user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          // Add other required fields from firebase.auth.User, possibly with defaults
          emailVerified: user.emailVerified || false,
          isAnonymous: user.isAnonymous || false,
          metadata: { creationTime: user.createdAt?.toString(), lastSignInTime: user.metadata?.lastLogin?.toString() },
          providerData: user.providerData || [],
          // Mock or provide necessary methods if Authorization class uses them
          getIdToken: async () => user.getIdToken ? await user.getIdToken() : '',
          // ... other methods/properties if needed
        } as User : null;

        // Use the singleton instance (lowercase 'a')
        const context = authorization.createContext(firebaseUser, initialData?.authorId);

        // Check access permission using the instance
        const canAccess = await authorization.canAccess(context, UserRole.USER);
        setIsAuthorized(canAccess);

        // Check if admin using the instance
        const isAdmin = await authorization.isAdmin(firebaseUser);
        setIsAdminUser(isAdmin);
      }
    };

    checkAuthorization();
  }, [user, authLoading, initialData?.authorId]);

  // Show loading indicator while checking auth or initial loading
  if (authLoading || isAuthorized === null) { // Check if isAuthorized is still null
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

    // Re-check authorization at the time of submission
    const firebaseUser = user ? {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified || false,
      isAnonymous: user.isAnonymous || false,
      metadata: { creationTime: user.createdAt?.toString(), lastSignInTime: user.metadata?.lastLogin?.toString() },
      providerData: user.providerData || [],
      getIdToken: async () => user.getIdToken ? await user.getIdToken() : '',
    } as User : null;
    // Use the singleton instance (lowercase 'a')
    const context = authorization.createContext(firebaseUser, initialData?.authorId);

    try {
      // Use the singleton instance (lowercase 'a')
      if (!(await authorization.canAccess(context, UserRole.USER))) {
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
        createdBy: initialData?.authorId || user?.uid,
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

  // Use the state variable for conditional rendering
  if (!isAuthorized) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            {/* Use the isAdminUser state variable */}
            {isAdminUser
              ? 'Unable to verify admin credentials.'
              : 'You do not have permission to modify this content. Only administrators or original creators can edit.'}
          </AlertDescription>
        </Alert>

        {/* Disable form inputs to prevent any interaction */}
        <div className="opacity-50 pointer-events-none">
          <Textarea
            placeholder={sectionDetails[section].placeholder}
            value={content}
            onChange={() => { }}
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

  // Render the form if authorized
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
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground">
          {sectionDetails[section].hint}
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {initialData ? 'Update' : 'Create'} {sectionDetails[section].title}
      </Button>
    </form>
  );
}
