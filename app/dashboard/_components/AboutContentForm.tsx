'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { doc, setDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AboutContent } from '@/app/types/about';

interface AboutContentFormProps {
  initialData?: AboutContent;
  section: "values" | "vision" | "mission";
  onSuccess?: () => void;
}

export default function AboutContentForm({ initialData, section, onSuccess }: AboutContentFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [content, setContent] = useState(initialData?.content || '');
  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = initialData?.id 
        ? doc(db, 'about', initialData.id)
        : doc(collection(db, 'about'));

      const title = `Our ${section.charAt(0).toUpperCase()}${section.slice(1)}`;
      
      await setDoc(docRef, {
        title,
        content,
        section,
        category: 'about',
        published: true,
        excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        updatedAt: Timestamp.now(),
        ...(initialData ? {} : { createdAt: Timestamp.now() })
      }, { merge: true });

      toast({
        title: 'Success',
        description: `${title} has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-lg font-medium">
            Our {section.charAt(0).toUpperCase()}{section.slice(1)}
          </h3>
          <Textarea
            placeholder={`Enter your ${section} statement...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
}
