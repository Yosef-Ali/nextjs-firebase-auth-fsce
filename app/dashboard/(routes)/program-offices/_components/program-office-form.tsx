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
import { ProgramOffice } from '@/app/types/program-office';
import { programOfficesService } from '@/app/services/program-offices';
import { Textarea } from '@/components/ui/textarea';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

const formSchema = z.object({
  region: z.string().min(1),
  location: z.string().min(1),
  address: z.string().min(1),
  contact: z.string().min(1),
  email: z.string().email(),
  beneficiaries: z.string().min(1),
  programs: z.string().min(1),
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

  const form = useForm<ProgramOfficeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      programs: initialData.programs.join('\n')
    } : {
      region: '',
      location: '',
      address: '',
      contact: '',
      email: '',
      beneficiaries: '',
      programs: ''
    }
  });

  const onSubmit = async (data: ProgramOfficeFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await programOfficesService.updateProgramOffice(initialData.id, {
          ...data,
          programs: data.programs.split('\n').filter(p => p.trim())
        });
      } else {
        await programOfficesService.createProgramOffice({
          ...data,
          programs: data.programs.split('\n').filter(p => p.trim())
        });
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
        title="Delete Program Office"
        description={`Are you sure you want to delete this program office? This action cannot be undone.`}
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
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                    <Input disabled={loading} placeholder="Email" {...field} />
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
                <FormItem className="col-span-2">
                  <FormLabel>Programs (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Enter programs (one per line)"
                      {...field}
                    />
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
