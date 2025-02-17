"use client";

import * as React from 'react';
import {
  Dialog as DialogRoot,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ExampleDialogProps {}

const ExampleDialog: React.FC<ExampleDialogProps> = () => {
  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title Here</DialogTitle>
          <DialogDescription>Dialog description goes here</DialogDescription>
        </DialogHeader>
        {/* Rest of your dialog content */}
      </DialogContent>
    </DialogRoot>
  )
}

export default ExampleDialog
