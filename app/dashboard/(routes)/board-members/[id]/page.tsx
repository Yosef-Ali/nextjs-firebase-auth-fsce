"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { BoardMemberForm } from "../../_components/board-member-form";
import { boardMemberService } from "@/app/services/board-members";
import { BoardMember } from "@/app/types/board-member";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface EditBoardMemberPageProps {
  params: {
    id: string;
  };
}

export default function EditBoardMemberPage({ params }: EditBoardMemberPageProps) {
  const router = useRouter();
  const [member, setMember] = useState<BoardMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const data = await boardMemberService.getBoardMember(params.id);
        if (!data) {
          toast.error("Board member not found");
          router.push("/dashboard/board-members");
          return;
        }
        setMember(data);
      } catch (error) {
        console.error("Error fetching board member:", error);
        toast.error("Failed to load board member");
        router.push("/dashboard/board-members");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/board-members")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Heading
                title="Edit Board Member"
                description="Update board member information"
              />
            </div>
          </div>
          <Separator />
          <BoardMemberForm
            initialData={member}
            onSuccess={() => router.push("/dashboard/board-members")}
          />
        </div>
      </div>
    </div>
  );
}
