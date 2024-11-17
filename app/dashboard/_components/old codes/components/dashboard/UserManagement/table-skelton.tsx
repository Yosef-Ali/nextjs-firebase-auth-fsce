import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TableSkelton = () => {
  return (
    <Card x-chunk="dashboard-05-chunk-3">
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
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-muted">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default TableSkelton;