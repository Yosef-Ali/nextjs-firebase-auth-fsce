"use client";

import { Plus, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { DataTable } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { BoardMember } from "@/app/types/board-member";
import { columns } from "./columns";
import { FounderForm } from "./founder-form";

interface BoardMemberClientProps {
  data: BoardMember[];
}

interface Founder {
  description: string;
  image: string;
}

export const BoardMemberClient: React.FC<BoardMemberClientProps> = ({ data }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [founder, setFounder] = useState<Founder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFounder = async () => {
      try {
        const docRef = doc(db, "founding-group", "main");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFounder(docSnap.data() as Founder);
        }
      } catch (error) {
        console.error("Error fetching founding group:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFounder();
  }, []);

  const handleSuccess = async () => {
    setIsEditing(false);
    const docRef = doc(db, "founding-group", "main");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setFounder(docSnap.data() as Founder);
    }
  };

  return (
    <div className="space-y-12">
      {/* Board Members Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading
            title={`Board Members (${data.length})`}
            description="Manage board members"
          />
          <Button onClick={() => router.push(`/dashboard/board-members/new`)}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
        <DataTable searchKey="name" columns={columns} data={data} />
      </div>

      {/* Founding Group Section */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-semibold">Founding Group</h3>
            <p className="text-muted-foreground mt-1">
              Manage the founding group's history and vision
            </p>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Information
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Edit Founding Group Information</DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <FounderForm
                  initialData={founder || undefined}
                  onSuccess={handleSuccess}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Founding Group Preview */}
        <div className="grid grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square relative bg-slate-100 rounded-lg overflow-hidden">
            {founder?.image ? (
              <Image
                src={founder.image}
                alt="Founding Group"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No group photo available
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col justify-center">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-6">
                {founder?.description || "No description provided"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
