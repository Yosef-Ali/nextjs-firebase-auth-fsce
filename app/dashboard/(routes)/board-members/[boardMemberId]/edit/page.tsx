"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BoardMemberForm } from "../../_components/board-member-form";
import { BoardMember } from "@/app/types/board-member";

const EditBoardMemberPage = () => {
  const params = useParams();
  const [boardMember, setBoardMember] = useState<BoardMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params) return;
    
    const unsubscribe = onSnapshot(
      doc(db, "board-members", params.boardMemberId as string),
      (doc) => {
        if (doc.exists()) {
          setBoardMember({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          } as BoardMember);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [params?.boardMemberId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BoardMemberForm initialData={boardMember} />
      </div>
    </div>
  );
};

export default EditBoardMemberPage;
