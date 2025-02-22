'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    onConfirm: () => void;
    isLoading?: boolean;
    title?: string;
    description?: string;
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    isLoading = false,
    title = "Confirm Delete",
    description = "Are you sure you want to delete this item? This action cannot be undone."
}: DeleteConfirmDialogProps) {
    const handleCancel = useCallback(() => {
        if (!isLoading && typeof onOpenChange === 'function') {
            onOpenChange(false);
        }
    }, [isLoading, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
