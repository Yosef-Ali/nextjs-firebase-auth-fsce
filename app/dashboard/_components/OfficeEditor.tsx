"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { ProgramOffice } from "@/app/types/program-office";
import { programOfficesService } from "@/app/services/program-offices";
import { Loader2 } from "lucide-react";

// Define form schema
const formSchema = z.object({
  region: z.string().min(1, "Region is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  contact: z.string().min(1, "Contact number is required"),
  email: z.string().email("Valid email is required"),
  beneficiaries: z.string().min(1, "Number of beneficiaries is required"),
  programs: z.string().min(1, "At least one program is required"),
  type: z.literal('Program')
});

type FormValues = z.infer<typeof formSchema>;

interface OfficeEditorProps {
  office?: ProgramOffice;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

export function OfficeEditor({ office, mode, onSuccess }: OfficeEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: office?.region || "",
      location: office?.location || "",
      address: office?.address || "",
      contact: office?.contact || "",
      email: office?.email || "",
      beneficiaries: office?.beneficiaries || "",
      programs: office?.programs?.join("\n") || "",
      type: "Program"
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      // Parse programs from textarea (line by line)
      const programs = data.programs
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const officeData = {
        ...data,
        programs,
      };

      if (mode === "create") {
        await programOfficesService.createProgramOffice(officeData);
        toast({
          title: "Success",
          description: "Office created successfully",
        });
      } else {
        if (!office?.id) {
          throw new Error("Office ID is missing");
        }
        await programOfficesService.updateProgramOffice(office.id, officeData);
        toast({
          title: "Success",
          description: "Office updated successfully",
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode === "create" ? "create" : "update"
          } office`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Addis Ababa" {...field} />
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
                  placeholder="e.g., Bole Sub City, Woreda 03"
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
                  placeholder="e.g., Building No. 345, Street Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., +251 116 393 229" {...field} />
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
                    placeholder="e.g., info.addis@fsce.org"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="beneficiaries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beneficiaries</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Serving over 5,000 children annually"
                  {...field}
                />
              </FormControl>
              <FormDescription>Describe the impact and number of beneficiaries</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="programs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Programs</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter programs (one per line)
e.g.,
Child Protection
Education Support
Family Strengthening"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter each program on a new line
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "create" ? "Create Office" : "Update Office"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
