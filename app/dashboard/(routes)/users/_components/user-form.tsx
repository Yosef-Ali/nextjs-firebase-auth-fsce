'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { AppUser } from '@/app/types/user';

const formSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  photoURL: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface UserFormProps {
  user: AppUser;
  onSave: (data: Partial<FormData>) => Promise<void>;
}

export function UserForm({ user, onSave }: UserFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      photoURL: user?.photoURL || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'User ID is missing',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      // Only send changed fields
      const dirtyFields = form.formState.dirtyFields;
      const changedData = Object.keys(dirtyFields).reduce((acc, key) => {
        if (dirtyFields[key as keyof FormData]) {
          acc[key as keyof FormData] = data[key as keyof FormData];
        }
        return acc;
      }, {} as Partial<FormData>);

      if (Object.keys(changedData).length === 0) {
        toast({
          title: 'No Changes',
          description: 'No changes were made to save',
        });
        return;
      }

      await onSave(changedData);
      
      toast({
        title: 'Success',
        description: 'User details updated successfully',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photoURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo URL</FormLabel>
              <FormControl>
                <Input {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
