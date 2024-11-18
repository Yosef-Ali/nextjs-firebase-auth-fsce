import Link from "next/link";
import { format } from "date-fns";
import { Download, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Resource } from "@/app/types/resource";
import { resourcesService } from "@/app/services/resources";

interface ResourceListProps {
  resources: Resource[];
  onDelete: (id: string) => void;
}

export function ResourceList({ resources, onDelete }: ResourceListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Published</TableHead>
          <TableHead>Downloads</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.map((resource) => (
          <TableRow key={resource.id}>
            <TableCell className="font-medium">
              <Link
                href={`/resources/${resource.type}/${resource.slug}`}
                className="hover:text-primary"
              >
                {resource.title}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {resource.type}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={resource.published ? "default" : "secondary"}
                className="capitalize"
              >
                {resource.published ? "Published" : "Draft"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{resource.downloadCount}</span>
              </div>
            </TableCell>
            <TableCell>
              {format(new Date(resource.publishedDate), "MMM d, yyyy")}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onDelete(resource.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
