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
import { Office } from "@/app/types/office";
import { officesService } from "@/app/services/offices";
import { Loader2 } from "lucide-react";

// Define form schema
const formSchema = z.object({
  name: z.string().min(1, "Office name is required"),
  location: z.string().min(1, "Location is required"),
  contact: z.string().min(1, "Contact number is required"),
  email: z.string().email("Valid email is required"),
  impact: z.string().min(1, "Impact description is required"),
  impactCount: z.coerce.number().min(1, "Impact count is required"),
  programs: z.string().min(1, "Programs are required"),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface OfficeEditorProps {
  office?: Office;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

export function OfficeEditor({ office, mode, onSuccess }: OfficeEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: office?.name || "",
      location: office?.location || "",
      contact: office?.contact || "",
      email: office?.email || "",
      impact: office?.impact || "",
      impactCount: office?.impactCount || 0,
      programs: office?.programs?.join("\n") || "",
      active: office?.active ?? true,
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
        await officesService.createOffice(officeData);
        toast({
          title: "Success",
          description: "Office created successfully",
        });
      } else {
        if (!office?.id) {
          throw new Error("Office ID is missing");
        }
        await officesService.updateOffice(office.id, officeData);
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
        description: `Failed to ${
          mode === "create" ? "create" : "update"
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Office Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Addis Ababa Office" {...field} />
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
                  placeholder="e.g., Bole Sub City, Woreda 03, Addis Ababa"
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
                    placeholder="e.g., info.addis@example.org"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="impact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Serving over 5,000 children and families"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="impactCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact Count</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 5000" {...field} />
                </FormControl>
                <FormDescription>Number of beneficiaries</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="programs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Programs</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter programs (one per line)"
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

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Set whether this office is currently active
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
