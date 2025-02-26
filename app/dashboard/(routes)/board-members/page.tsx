"use client";

import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BoardMemberClient } from "./_components/client";
import { BoardMember } from "@/app/types/board-member";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FounderForm } from "./_components/founder-form";
import { Separator } from "@/components/ui/separator";

interface FoundingGroup {
  id: string;
  name: string;
  description: string;
  image: string;
}

const BoardMembersPage = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [foundingGroup, setFoundingGroup] = useState<FoundingGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupListeners = async () => {
      try {
        // Clear any existing listener
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }

        // Fetch board members with listener
        const unsubscribe = onSnapshot(
          query(collection(db, "board-members"), orderBy("name")),
          (snapshot) => {
            if (!mounted) return;

            const members = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
              updatedAt: doc.data().updatedAt?.toDate()
            })) as BoardMember[];
            setBoardMembers(members);
            setLoading(false);
          },
          (error) => {
            console.error("Error in board members listener:", error);
            if (mounted) {
              setLoading(false);
            }
          }
        );

        unsubscribeRef.current = unsubscribe;

        // Fetch founding group data
        if (mounted) {
          const foundingGroupDoc = await getDoc(doc(db, "founding-group", "main"));
          if (foundingGroupDoc.exists() && mounted) {
            const data = foundingGroupDoc.data();
            setFoundingGroup({
              id: foundingGroupDoc.id,
              name: data.name,
              description: data.bio,  // Map Firestore 'bio' field to 'description'
              image: data.image
            });
          }
        }
      } catch (error) {
        console.error("Error setting up listeners:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setupListeners();

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Board Members Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your board members and founding group information.
          </p>
        </div>
        <Separator />

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Board Members</TabsTrigger>
            <TabsTrigger value="founding">Founding Group</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <BoardMemberClient data={boardMembers} />
          </TabsContent>

          <TabsContent value="founding" className="space-y-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h3 className="text-lg font-medium">Founding Group Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update the founding group section that appears on the board members page.
                </p>
              </div>
              <FounderForm
                initialData={{
                  image: foundingGroup?.image || '',
                  bio: foundingGroup?.description || ''
                }}
                onSuccess={() => {
                  // Optionally refresh the data
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BoardMembersPage;
