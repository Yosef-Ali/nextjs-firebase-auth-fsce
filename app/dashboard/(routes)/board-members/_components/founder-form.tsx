"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  image: z.string().min(1, "Image is required"),
  bio: z.string().min(1, "Bio is required").max(1000, "Bio should be less than 1000 characters"),
});

type FounderFormValues = z.infer<typeof formSchema>;


interface FounderFormProps {
  initialData?: FounderFormValues;
  onSuccess?: () => void;
}

export const FounderForm: React.FC<FounderFormProps> = ({
  initialData,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FounderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      image: "",
      bio: "",
    },
  });

  const onSubmit = async (data: FounderFormValues) => {
    try {
      setLoading(true);
      const docRef = doc(db, "founding-group", "main");

      // First get existing data
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.exists() ? docSnap.data() : {};

      // Merge with new data
      await setDoc(
        docRef,
        {
          ...existingData,
          image: data.image,
          bio: data.bio,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: "Success",
        description: "Founding group information updated successfully.",
      });
      onSuccess?.();
    } catch (error) {
      console.error("[FOUNDER_FORM]", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div>
                    <FormLabel className="text-lg font-semibold">Group Photo</FormLabel>
                    <FormDescription>
                      Upload a photo of the founding group. Recommended size: 800x400px.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <ImageUpload
                      value={field.value ? [field.value] : []}
                      disabled={loading}
                      onChange={(url) => field.onChange(url)}
                      onRemove={() => field.onChange("")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Description */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <div>
                  <FormLabel className="text-lg font-semibold">Founding Group Bio</FormLabel>
                  <FormDescription>
                    Highlight the group's vision, mission, and key achievements in establishing FSCE.
                  </FormDescription>
                </div>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder="Write a detailed bio for the founding group..."
                    className="resize-none min-h-[250px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-muted-foreground mt-2">
                  {field.value?.length || 0}/1000 characters
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            disabled={loading}
            type="submit"
            size="lg"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};
