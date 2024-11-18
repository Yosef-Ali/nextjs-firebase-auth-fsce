"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { toast } from "sonner";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ResourceUploader } from "@/app/components/resource-uploader";
import { ImageUpload } from "@/app/components/image-upload";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["publication", "report", "toolkit", "research"]),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  fileUrl: z.string().min(1, "Resource file is required"),
  published: z.boolean().default(false),
  publishedDate: z.number(),
});

interface ResourceFormProps {
  initialData?: z.infer<typeof formSchema> & { id: string };
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
}

export function ResourceForm({ initialData, onSubmit }: ResourceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      type: "publication",
      content: "",
      coverImage: "",
      fileUrl: "",
      published: false,
      publishedDate: Date.now(),
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await onSubmit(values);
      router.push("/dashboard/resources");
      toast.success("Resource saved successfully");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder="Resource title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder="Resource description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="publication">Publication</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="toolkit">Toolkit</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder="Resource content or summary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image (Optional)</FormLabel>
                <FormDescription>
                  Add a cover image to make your resource more visually appealing
                </FormDescription>
                <FormControl>
                  <ImageUpload
                    value={field.value ?? ""}
                    disabled={isLoading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fileUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource File</FormLabel>
                <FormControl>
                  <ResourceUploader
                    value={field.value || ""}
                    disabled={isLoading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Published</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Make this resource available to the public
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex items-center gap-x-2">
            <Button
              disabled={isLoading}
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/resources")}
            >
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              {initialData ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
