"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { BoardMembersList } from "./_components/board-members-list";
import { boardMemberService } from "@/app/services/board-members";
import { BoardMember } from "@/app/types/board-member";
import { toast } from "sonner";
import { useAuth } from "@/app/hooks/useAuth";

export default function BoardMembersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await boardMemberService.getBoardMembers(true);
      setMembers(data);
    } catch (error) {
      console.error("Error fetching board members:", error);
      toast.error("Failed to load board members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-muted-foreground">Please log in to view board members</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-muted-foreground">Loading board members...</p>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Board Members"
            description="Manage your organization's board members"
          />
          <Button onClick={() => router.push("/dashboard/board-members/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
       
        <BoardMembersList members={members} onUpdate={fetchMembers} />
      </div>
    </div>
  );
}
