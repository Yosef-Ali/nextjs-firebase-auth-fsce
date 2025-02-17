'use client';

import { Media } from '@/app/types/media';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import MediaGrid from './MediaGrid';

interface UploadDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isLoading: boolean;
    error: string | null;
    filteredMedia: Media[];
    onView: (media: Media) => void;
}

export function UploadDialog({
    isOpen,
    onOpenChange,
    isLoading,
    error,
    filteredMedia,
    onView,
}: UploadDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Upload Media</DialogTitle>
                    <DialogDescription>
                        {isLoading ? 'Loading media...' : `${filteredMedia.length} items found`}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="h-[400px] flex items-center justify-center text-destructive">
                        <p>{error}</p>
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                        <p>No media found</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px]">
                        <MediaGrid
                            items={filteredMedia}
                            onView={onView}
                        />
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}