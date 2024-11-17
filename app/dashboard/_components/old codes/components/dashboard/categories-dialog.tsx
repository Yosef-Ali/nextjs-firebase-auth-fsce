"use client";
import { useState } from "react";
import { CustomDialog } from "./custom-dialog";
import { title } from "process";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface DialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const CategoriesDialog: React.FC<DialogProps> = ({ open, setOpen }) => {
  return (
    <CustomDialog
      open={open}
      onOpenChange={(e) => setOpen(e)}
      title="Create a new category"
      description="Create a new category for your site."
    >
      <div className="grid gap-4">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          className="w-full"
          placeholder="Add title here"
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="name">Slug</Label>
        <Input
          id="name"
          type="text"
          className="w-full"
          placeholder="Add slug here"
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="name">Description</Label>
        <Input
          id="name"
          type="text"
          className="w-full"
          placeholder="Add description here"
        />
      </div>
    </CustomDialog>
  );
};