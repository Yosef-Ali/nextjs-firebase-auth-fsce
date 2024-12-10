'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useForm } from 'react-hook-form';
import { useProgramOffices } from '@/app/context/program-offices';

interface ProgramOfficeFormValues {
  type: 'Program';
  region: string;
  location: string;
  address: string;
  contact: string;
  email: string;
  beneficiaries: string;
  programs: string[];
}

interface ProgramOfficeFormProps {
  initialData?: ProgramOfficeFormValues & { id: string } | null;
  title?: string;
}

export default function ProgramOfficeForm({ initialData, title }: ProgramOfficeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { addOffice, updateOffice } = useProgramOffices();

  const description = initialData ? 'Edit program office details.' : 'Add a new program office';
  const toastMessage = initialData ? 'Program office updated.' : 'Program office created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<ProgramOfficeFormValues>({
    defaultValues: initialData || {
      type: 'Program',
      region: '',
      location: '',
      address: '',
      contact: '',
      email: '',
      beneficiaries: '',
      programs: [],
    },
  });

  const onSubmit = async (data: ProgramOfficeFormValues) => {
    try {
      setLoading(true);
      const submissionData = {
        ...data,
      };
      
      if (initialData) {
        await updateOffice(initialData.id, submissionData);
      } else {
        await addOffice(submissionData);
      }
      
      toast.success(toastMessage);
      
      router.push("/dashboard/program-offices");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title || "Program Office"} description={description} />
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Region" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Contact" {...field} />
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
                    <Input disabled={loading} type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="beneficiaries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiaries</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Beneficiaries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="programs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programs (comma-separated)</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="Program1, Program2, Program3" 
                      {...field} 
                      onChange={(e) => {
                        const programs = e.target.value.split(',').map(p => p.trim());
                        form.setValue('programs', programs);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
}
