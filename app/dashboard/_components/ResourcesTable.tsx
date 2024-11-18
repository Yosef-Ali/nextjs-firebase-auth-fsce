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
import { MoreHorizontal, Plus, ArrowUpDown, Download } from 'lucide-react';
import { Resource } from '@/app/types/resource';
import { resourcesService } from '@/app/services/resources';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

interface ResourcesTableProps {
  initialResources: Resource[];
}

export function ResourcesTable({ initialResources }: ResourcesTableProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: 'title' | 'type' | 'updatedAt';
    direction: 'asc' | 'desc';
  }>({ key: 'updatedAt', direction: 'desc' });

  useEffect(() => {
    setResources(initialResources);
    const loadResources = async () => {
      if (!user) return;
      try {
        const allResources = await resourcesService.getPublishedResources();
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
  }, [user, initialResources]);

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
    if (!user || isDeleting) return;
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
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resources</h2>
        <Button onClick={() => router.push('/dashboard/resources/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1"
                >
                  Title
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-1"
                >
                  Type
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('updatedAt')}
                  className="flex items-center gap-1"
                >
                  Last Updated
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell className="font-medium">{resource.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{resource.downloadCount}</TableCell>
                <TableCell>{format(resource.updatedAt, 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/resources/${resource.id}`)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(resource.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
