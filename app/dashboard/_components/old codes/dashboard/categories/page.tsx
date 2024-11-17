"use client";
import { useQuery, useMutation } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { CategoryCard } from "./category-card";
import { CategoriesDialog } from "./categories-dialog";
import { Button } from "@/components/ui/button";
import { CirclePlusIcon } from "lucide-react";

const generateSlug = (title: string) => {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric chars with hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .trim();
};

type CategoryFormData = {
  title: string;
  description: string;
};

export default function Categories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const categories = useQuery(api.categories.list) || [];
  const createCategory = useMutation(api.categories.create);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleCreateCategory = async (formData: CategoryFormData) => {
    await createCategory({
      ...formData,
      slug: generateSlug(formData.title)
    });
    handleCloseDialog();
  };

  return (
    <main className="grid px-4 sm:px-6 py-24 gap-4">
      <div className="flex justify-end">
        <Button className="h-8 gap-1" size="sm" onClick={handleOpenDialog}>
          <CirclePlusIcon className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Category</span>
        </Button>
      </div>
      <CategoryCard categories={categories} />
      <CategoriesDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleCreateCategory}
      />
    </main>
  );
}


