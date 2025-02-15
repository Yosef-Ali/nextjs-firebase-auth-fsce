"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BoardMemberClient } from "./_components/client";
import { BoardMember } from "@/app/types/board-member";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FounderForm } from "./_components/founder-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FoundingGroup {
  image: string;
  description: string;
}

const BoardMembersPage = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [foundingGroup, setFoundingGroup] = useState<FoundingGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch board members
    const unsubscribe = onSnapshot(
      query(collection(db, "board-members"), orderBy("name")),
      (snapshot) => {
        const members = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as BoardMember[];
        setBoardMembers(members);
        setLoading(false);
      }
    );

    // Fetch founding group data
    const fetchFoundingGroup = async () => {
      try {
        const foundingGroupDoc = await getDoc(doc(db, "founding-group", "main"));
        if (foundingGroupDoc.exists()) {
          setFoundingGroup(foundingGroupDoc.data() as FoundingGroup);
        }
      } catch (error) {
        console.error("Error fetching founding group:", error);
      }
    };

    fetchFoundingGroup();
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-muted-foreground">Loading board members...</p>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto space-y-8">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Leadership Management
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Manage organization leadership including board members and founding group information. Update member details and maintain organizational structure.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-transparent border rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b rounded-t-lg">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Leadership</h3>
        </CardHeader>
        
        <div className="p-4">
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members">Board Members</TabsTrigger>
              <TabsTrigger value="founding">Founders</TabsTrigger>
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
                  initialData={foundingGroup || undefined}
                  onSuccess={() => {
                    // Optionally refresh the data
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default BoardMembersPage;
