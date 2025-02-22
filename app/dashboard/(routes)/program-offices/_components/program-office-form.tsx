'use client';

import * as z from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { ProgramOffice, ProgramOfficeCreate } from '@/app/types/program-office';
import { programOfficesService } from '@/app/services/program-offices';
import { Textarea } from '@/components/ui/textarea';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

// Create an ID from the location name
const createId = (location: string) => {
  return location.toLowerCase().replace(/\s+/g, '-');
};

const formSchema = z.object({
  id: z.string().optional(),
  type: z.string().default("Program"),
  region: z.string().min(1, 'Region is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  contact: z.string().min(1, 'Contact is required'),
  email: z.string().email('Invalid email address'),
  beneficiaries: z.string().min(1, 'Beneficiaries description is required'),
  programs: z.array(z.string()).min(1, 'At least one program is required'),
});

type ProgramOfficeFormValues = z.infer<typeof formSchema>;

interface ProgramOfficeFormProps {
  initialData: ProgramOffice | null;
}

export const ProgramOfficeForm: React.FC<ProgramOfficeFormProps> = ({
  initialData
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit program office' : 'Create program office';
  const description = initialData ? 'Edit program office details.' : 'Add a new program office';
  const toastMessage = initialData ? 'Program office updated.' : 'Program office created.';
  const action = initialData ? 'Save changes' : 'Create';

  const defaultPrograms = [
    'Early Childhood Education',
    'Youth Empowerment',
    'Family Support Services',
    'Community Development'
  ];

  const form = useForm<ProgramOfficeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      programs: initialData.programs
    } : {
      type: 'Program' as const,
      region: '',
      location: '',
      address: '',
      contact: '',
      email: '',
      beneficiaries: '',
      programs: defaultPrograms
    }
  });

  const onSubmit = async (data: ProgramOfficeFormValues) => {
    try {
      setLoading(true);
      const formData: ProgramOfficeCreate = {
        type: 'Program' as const,
        region: data.region,
        location: data.location,
        address: data.address,
        contact: data.contact,
        email: data.email,
        beneficiaries: data.beneficiaries,
        programs: data.programs
      };

      if (initialData) {
        await programOfficesService.updateProgramOffice(initialData.id, formData);
      } else {
        await programOfficesService.createProgramOffice(formData);
      }

      router.refresh();
      router.push(`/dashboard/program-offices`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      if (initialData) {
        await programOfficesService.deleteProgramOffice(initialData.id);
        router.refresh();
        router.push(`/dashboard/program-offices`);
        toast.success('Program office deleted.');
      }
    } catch (error: any) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <DeleteConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={onDelete}
        isLoading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="e.g. Addis Ababa"
                      {...field}
                    />
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
                    <Input
                      disabled={loading}
                      placeholder="e.g. Addis Ababa"
                      {...field}
                    />
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
                    <Input
                      disabled={loading}
                      placeholder="e.g. Bole Sub City, Woreda 03, Addis Ababa"
                      {...field}
                    />
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
                    <Input
                      disabled={loading}
                      placeholder="e.g. +251 116 393 229"
                      {...field}
                    />
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
                    <Input
                      disabled={loading}
                      placeholder="e.g. info.addis@example.org"
                      type="email"
                      {...field}
                    />
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
                    <Input
                      disabled={loading}
                      placeholder="e.g. Serving over 5,000 children and families"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="programs"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Programs</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {defaultPrograms.map((program, index) => (
                        <Input
                          key={index}
                          disabled={loading}
                          placeholder={`Program ${index + 1}`}
                          value={field.value[index] || ''}
                          onChange={(e) => {
                            const newPrograms = [...field.value];
                            newPrograms[index] = e.target.value;
                            field.onChange(newPrograms);
                          }}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
