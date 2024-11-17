import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type CategoriesDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (category: { title: string; description: string }) => void;
};

export function CategoriesDialog({ open, onClose, onSubmit }: CategoriesDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description
    });
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter category title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Create Category</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}