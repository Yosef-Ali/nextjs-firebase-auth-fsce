"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import TableSkeleton from "./table-skelton";
import UserRow from "./user-row";

const UserTable = () => {
  const users = useQuery(api.users.getAllUsers);

  if (users === undefined) {
    return <TableSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Users</CardTitle>
        <CardDescription>All users in your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <UserRow key={user._id} user={user} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserTable;