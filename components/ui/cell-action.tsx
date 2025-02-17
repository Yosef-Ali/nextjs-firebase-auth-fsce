import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Edit, Trash, Copy, Key, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: () => void | Promise<void>;
  variant?: "default" | "destructive";
}

interface CellActionProps {
  actions: Action[];
  isLoading?: boolean;
}

export const CellAction: React.FC<CellActionProps> = ({ actions, isLoading }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: Action) => {
    try {
      setLoading(true);
      await action.onClick();
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        title: "Error",
        description: "Operation failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <span className="sr-only">Open menu</span>
          {isLoading || loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MoreHorizontal className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => handleAction(action)}
            className={action.variant === "destructive" ? "text-red-600" : ""}
            disabled={loading || isLoading}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};