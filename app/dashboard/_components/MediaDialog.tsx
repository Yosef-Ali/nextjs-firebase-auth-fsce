'use client';

import { Media } from '@/app/types/media';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MediaViewer from './MediaViewer';
import MediaEditor from './MediaEditor';

interface MediaDialogProps {
    media: Media | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing: boolean;
    onEdit: () => void;
    onClose: () => void;
    onEditComplete: () => void;
    onCancelEdit: () => void;
}

export function MediaDialog({
    media,
    isOpen,
    onOpenChange,
    isEditing,
    onEdit,
    onClose,
    onEditComplete,
    onCancelEdit
}: MediaDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>{media?.name || 'Media Details'}</DialogTitle>
                </DialogHeader>
                {media && !isEditing ? (
                    <MediaViewer
                        media={media}
                        onClose={onClose}
                        onEdit={onEdit}
                    />
                ) : media && isEditing ? (
                    <MediaEditor
                        media={media}
                        onSave={onEditComplete}
                        onCancel={onCancelEdit}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}