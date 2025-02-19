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
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="sr-only">
            Accessible Title
          </DialogTitle>
          {/* Your visible content */}
        </DialogHeader>
      </DialogContent>
    </DialogRoot>
  )
}

export default ExampleDialog
