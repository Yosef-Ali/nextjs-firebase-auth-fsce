"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { BoardMemberForm } from "../_components/board-member-form";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

export default function NewBoardMemberPage() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-muted-foreground">Please log in to create board members</p>
      </div>
    );
  }

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
                title="Create Board Member"
                description="Add a new board member to your organization"
              />
            </div>
          </div>
          <Separator />
          <BoardMemberForm
            onSuccess={() => router.push("/dashboard/board-members")}
          />
        </div>
      </div>
    </div>
  );
}
