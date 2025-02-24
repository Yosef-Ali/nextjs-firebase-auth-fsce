"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BoardMemberForm } from "../../_components/board-member-form";
import { BoardMember } from "@/app/types/board-member";

const EditBoardMemberPage = () => {
  const params = useParams();
  const [boardMember, setBoardMember] = useState<BoardMember | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!params) return;

    const setupListener = () => {
      try {
        // Clear any existing listener
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }

        const unsubscribe = onSnapshot(
          doc(db, "board-members", params.boardMemberId as string),
          (doc) => {
            if (!mounted) return;

            if (doc.exists()) {
              setBoardMember({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
              } as BoardMember);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error in board member listener:', error);
            if (mounted) {
              setLoading(false);
            }
          }
        );

        unsubscribeRef.current = unsubscribe;
      } catch (error) {
        console.error('Error setting up board member listener:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setupListener();

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [params]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!boardMember) {
    return <div>Board member not found.</div>;
  }

  return <BoardMemberForm initialData={boardMember} />;
}

export default EditBoardMemberPage;
