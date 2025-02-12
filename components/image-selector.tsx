'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import MediaLibraryPage from '@/app/dashboard/(routes)/media-library/page';

interface ImageSelectorProps {
    value?: string;
    onChange: (url: string) => void;
    className?: string;
}

export function ImageSelector({ value, onChange, className }: ImageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleImageSelect = (item: { url: string }) => {
        onChange(item.url);
        setIsOpen(false);
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
                        <Button variant="outline" className="w-full">
                            Select Image
                        </Button>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="w-full max-w-4xl h-[80vh]">
                <MediaLibraryPage
                    selectionMode={true}
                    onSelect={handleImageSelect}
                    onClose={() => setIsOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}