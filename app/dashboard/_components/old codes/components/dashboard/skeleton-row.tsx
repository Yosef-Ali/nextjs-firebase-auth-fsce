import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";

const SkeletonRow = () => {
  return (
    <TableRow>
      <TableCell className="w-1/3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4 mt-2" />
      </TableCell>
      <TableCell className="hidden sm:table-cell w-1/6">
        <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell className="hidden sm:table-cell w-1/6">
        <Skeleton className="h-6 w-full" />
      </TableCell>
      <TableCell className="hidden md:table-cell w-1/6">
        <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell className="hidden md:table-cell w-1/6">
        <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell className="w-1/12">
        <Skeleton className="h-8 w-8 rounded-full" />
      </TableCell>
    </TableRow>
  );
};

export default SkeletonRow;
