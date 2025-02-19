"use client";

import { useState } from "react";
import { Copy, Edit, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CellAction } from "@/components/ui/cell-action";
import { AlertModal } from "@/components/modals/alert-modal";
import { Partner } from "@/types";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PartnerCellActionProps {
  data: Partner;
}

export const PartnerCellAction: React.FC<PartnerCellActionProps> = ({ data }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onConfirm = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "partners", data.id));
      toast({
        description: "Partner deleted successfully.",
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong.",
      });
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      description: "Partner ID copied to clipboard.",
    });
  };

  const actions = [
    {
      label: "Copy Id",
      icon: <Copy className="mr-2 h-4 w-4" />,
      onClick: () => onCopy(data.id)
    },
    {
      label: "Update",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: () => router.push(`/dashboard/partners/${data.id}/edit`)
    },
    {
      label: "Delete",
      icon: <Trash className="mr-2 h-4 w-4" />,
      onClick: () => setOpen(true),
      variant: "destructive"
    }
  ];

  return <CellAction actions={actions} isLoading={loading} />;
};
