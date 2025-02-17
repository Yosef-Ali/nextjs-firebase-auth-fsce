'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import MediaGrid from "@/app/dashboard/_components/MediaGrid";
import { cn } from "@/lib/utils";
import { mediaService } from "@/app/services/media";
import { Media } from "@/app/types/media";
import { useToast } from "@/hooks/use-toast";

export interface ImageSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
}

export function ImageSelector({ value, onChange, className }: ImageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [media, setMedia] = useState<Media[]>([]);
    const { toast } = useToast();

    const loadMedia = async () => {
        try {
            setIsLoading(true);
            const result = await mediaService.getMedia();
            setMedia(result.items);
        } catch (error) {
            console.error('Error loading media:', error);
            toast({
                title: "Error",
                description: "Failed to load media. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (id: string) => {
        const selectedMedia = media.find(m => m.id === id);
        if (selectedMedia) {
            onChange(selectedMedia.url);
            setIsOpen(false);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-primary transition-colors",
                    "min-h-[200px]"
                )}
                onClick={() => {
                    setIsOpen(true);
                    loadMedia();
                }}
            >
                {value ? (
                    <img
                        src={value}
                        alt="Selected image"
                        className="max-h-[180px] object-contain"
                    />
                ) : (
                    <div className="text-center">
                        <svg
                            className="w-8 h-8 mx-auto text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="block mt-2 text-sm text-gray-500">Click to select an image</span>
                    </div>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Select Image</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 py-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-12 h-12 border-4 rounded-full animate-spin border-primary border-t-transparent"></div>
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto">
                                <MediaGrid
                                    items={media}
                                    selectable
                                    selectedItems={value ? [media.find(m => m.url === value)?.id || ''] : []}
                                    onSelect={handleSelect}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
