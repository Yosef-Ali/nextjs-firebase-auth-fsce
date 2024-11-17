import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
};

export const CustomDialog = ({ open, onOpenChange, title, description, children }: DialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <>
          <main className="grid gap-4 p-4 md:gap-8">
            {children}
          </main>
        </>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};