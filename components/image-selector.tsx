'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import MediaLibrary from '@/components/media-library/MediaLibrary';
import { ImageIcon } from 'lucide-react';

interface ImageSelectorProps {
    onImageSelect: (url: string) => void;
    className?: string;
}

export function ImageSelector({ onImageSelect, className }: ImageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleImageSelect = (item: { url: string }) => {
        onImageSelect(item.url);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className={className}>
                    <Button variant="outline">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Select Image
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="w-full max-w-4xl h-[80vh]">
                <MediaLibrary
                    selectionMode={true}
                    onSelect={handleImageSelect}
                    onClose={() => setIsOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}