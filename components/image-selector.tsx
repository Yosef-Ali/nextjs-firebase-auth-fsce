'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import MediaGrid from '@/app/dashboard/_components/MediaGrid';  // Changed to default import
import { mediaService } from '@/app/services/media';
import { Media } from '@/app/types/media';

interface ImageSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
}

export function ImageSelector({ value, onChange, className }: ImageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [media, setMedia] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadMedia = async () => {
        try {
            setIsLoading(true);
            const { items } = await mediaService.getMedia();
            setMedia(items.filter(item => item.type === 'image'));
        } catch (error) {
            console.error('Error loading media:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageSelect = (id: string, selected: boolean) => {
        const selectedMedia = media.find(m => m.id === id);
        if (selectedMedia && selected) {
            onChange(selectedMedia.url);
            setIsOpen(false);
        }
    };

    const openDialog = () => {
        loadMedia();
        setIsOpen(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className={className}>
                    {value ? (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                            <Image
                                src={value}
                                alt="Selected image"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={openDialog}>
                            Select Image
                        </Button>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="w-full max-w-4xl h-[80vh]">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : (
                    <MediaGrid
                        items={media}
                        selectable={true}
                        selectedItems={media.filter(m => m.url === value).map(m => m.id)}
                        onSelect={handleImageSelect}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}