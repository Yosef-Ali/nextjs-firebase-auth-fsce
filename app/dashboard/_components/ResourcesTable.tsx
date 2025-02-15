'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  ArrowUpDown,
  Download,
  Pencil,
  Trash
} from 'lucide-react';
import { Resource } from '@/app/types/resource';
import { resourcesService } from '@/app/services/resources';
import { useAuth } from '@/app/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

interface ResourcesTableProps {
  initialResources: Resource[];
}

export function ResourcesTable({ initialResources = [] }: ResourcesTableProps) {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: 'title' | 'type' | 'updatedAt';
    direction: 'asc' | 'desc';
  }>({ key: 'updatedAt', direction: 'desc' });

  // Helper function to check if user has admin access
  const checkAdminAccess = () => {
    if (!user || !userData) return false;
    return userData.role === 'admin' || userData.role === 'super_admin';
  };

  useEffect(() => {
    const loadResources = async () => {
      if (!user) return;
      try {
        const allResources = await resourcesService.getAllResources();
        setResources(allResources);
      } catch (error) {
        console.error('Error loading resources:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resources',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadResources();
  }, [user]);

  const handleSort = (key: 'title' | 'type' | 'updatedAt') => {
    setSortConfig((currentConfig) => ({
      key,
      direction:
        currentConfig.key === key && currentConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const sortedResources = [...resources].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    if (sortConfig.key === 'updatedAt') {
      return (a.updatedAt - b.updatedAt) * direction;
    }
    return a[sortConfig.key].localeCompare(b[sortConfig.key]) * direction;
  });

  const handleDelete = async (resourceId: string) => {
    if (!user || isDeleting || !checkAdminAccess()) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to delete resources',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDeleting(true);
      await resourcesService.deleteResource(resourceId);
      setResources((current) =>
        current.filter((resource) => resource.id !== resourceId)
      );
      toast({
        title: 'Success',
        description: 'Resource deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
      </div>
    );
  }

  const canManageResources = checkAdminAccess();

  return (
    <div className="overflow-hidden bg-transparent">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Downloads</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResources.map((resource) => (
            <TableRow key={resource.id} className="hover:bg-muted/50">
              <TableCell>{resource.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-transparent">
                  {resource.type}
                </Badge>
              </TableCell>
              <TableCell>
                {format(resource.updatedAt, 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`bg-transparent ${resource.published ? 'border-primary text-primary' : ''}`}
                >
                  {resource.published ? 'Published' : 'Draft'}
                </Badge>
              </TableCell>
              <TableCell>{resource.downloadCount || 0}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-8 h-8 p-0"
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {resource.fileUrl && (
                      <DropdownMenuItem
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                    )}
                    {canManageResources && (
                      <>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/resources/${resource.id}`)
                          }
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(resource.id)}
                          className="text-red-600"
                          disabled={isDeleting}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
