import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PostFormData } from './PostForm';
import { Media } from '@/app/types/media';
import { mediaService } from '@/app/services/media';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import MediaGrid from '@/app/dashboard/_components/MediaGrid';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';

interface PostImagesFieldProps {
    form: UseFormReturn<PostFormData>;
}

// Using named export instead of default
export function PostImagesField({ form }: PostImagesFieldProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryMedia, setGalleryMedia] = useState<Media[]>([]);
    const [isLoadingMedia, setIsLoadingMedia] = useState(false);
    const [loadingGalleryStart, setLoadingGalleryStart] = useState(false);
    const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

    const uploadImageToFirebase = async (file: File) => {
        if (!user) throw new Error('You must be logged in to upload images.');

        if (!file.type.startsWith('image/')) {
            throw new Error('Invalid file type. Please upload an image.');
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size exceeds 5MB limit.');
        }

        try {
            const result = await mediaService.uploadMedia(file, {
                name: file.name,
                description: '',
                type: 'image',
                tags: [],
                alt: '',
                caption: '',
                uploadedBy: user.uid,
                uploadedByEmail: user.email || '',
            });

            return result.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Failed to upload image. Please try again.');
        }
    };

    const loadMedia = async () => {
        try {
            setIsLoadingMedia(true);
            const result = await mediaService.getMedia();

            if (!result.items || result.items.length === 0) {
                toast({
                    title: "No Images",
                    description: "No images found in the gallery",
                });
                return;
            }

            const validImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
            const filteredMedia = result.items
                .filter(item => {
                    if (item.type !== 'image') return false;
                    const extension = item.url.split('.').pop()?.toLowerCase();
                    return extension && validImageTypes.includes(extension);
                })
                .map(item => ({
                    ...item,
                    createdAt: item.createdAt instanceof Timestamp
                        ? item.createdAt.toDate()
                        : new Date(item.createdAt),
                    updatedAt: item.updatedAt instanceof Timestamp
                        ? item.updatedAt.toDate()
                        : new Date(item.updatedAt)
                }))
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            setGalleryMedia(filteredMedia);
        } catch (error) {
            console.error('Error loading media:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to load media",
                variant: "destructive",
            });
        } finally {
            setIsLoadingMedia(false);
        }
    };

    const handleGallerySelect = (id: string, selected: boolean) => {
        const media = galleryMedia.find(m => m.id === id);
        if (!media) return;

        const currentImages = form.getValues('images') || [];
        const newImages = selected
            ? currentImages.includes(media.url)
                ? currentImages
                : [...currentImages, media.url]
            : currentImages.filter(url => url !== media.url);

        form.setValue('images', newImages, { shouldValidate: true });

        if (selected && !currentImages.includes(media.url)) {
            toast({
                title: "Image Added",
                description: "Image has been added to your post",
            });
        } else if (!selected && currentImages.includes(media.url)) {
            toast({
                title: "Image Removed",
                description: "Image has been removed from your post",
            });
        }
    };

    const openGallery = async () => {
        try {
            setLoadingGalleryStart(true);
            setIsGalleryOpen(true);
            await loadMedia();
        } catch (error) {
            console.error('Error loading gallery:', error);
            toast({
                title: "Error",
                description: "Failed to load media gallery. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoadingGalleryStart(false);
        }
    };

    const handleImageError = (imageUrl: string) => {
        setImageErrors(prev => ({
            ...prev,
            [imageUrl]: true
        }));
    };

    return (
        <>
            <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                    {field.value?.map((imageUrl, index) => (
                                        <div key={index} className="relative group">
                                            {imageErrors[imageUrl] ? (
                                                <div className="w-full h-40 flex items-center justify-center bg-muted rounded-lg">
                                                    <span className="text-sm text-muted-foreground">Image not available</span>
                                                </div>
                                            ) : (
                                                <Image
                                                    src={imageUrl}
                                                    alt={`Post image ${index + 1}`}
                                                    width={320}
                                                    height={160}
                                                    className="w-full h-40 object-cover rounded-lg"
                                                    onError={() => handleImageError(imageUrl)}
                                                    unoptimized
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = [...(field.value || [])];
                                                    newImages.splice(index, 1);
                                                    setImageErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors[imageUrl];
                                                        return newErrors;
                                                    });
                                                    field.onChange(newImages);
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-primary cursor-pointer transition-colors"
                                            onClick={() => {
                                                document.getElementById('image-upload')?.click();
                                            }}
                                        >
                                            <div className="text-center">
                                                <svg
                                                    className="w-8 h-8 text-gray-400 mx-auto"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 4v16m8-8H4"
                                                    />
                                                </svg>
                                                <span className="mt-2 text-sm text-gray-500 block">Upload Images</span>
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                "border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center transition-colors",
                                                !loadingGalleryStart && "hover:border-primary cursor-pointer",
                                                loadingGalleryStart && "opacity-50 cursor-not-allowed"
                                            )}
                                            onClick={() => {
                                                if (!loadingGalleryStart) {
                                                    openGallery();
                                                }
                                            }}
                                        >
                                            <div className="text-center">
                                                {loadingGalleryStart ? (
                                                    <>
                                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                        <span className="mt-2 text-sm text-gray-500 block">Loading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg
                                                            className="w-8 h-8 text-gray-400 mx-auto"
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
                                                        <span className="mt-2 text-sm text-gray-500 block">Select from Gallery</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={async (e) => {
                                        try {
                                            const files = Array.from(e.target.files || []);
                                            const uploadPromises = files.map(uploadImageToFirebase);
                                            const urls = await Promise.all(uploadPromises);
                                            field.onChange([...field.value || [], ...urls]);
                                        } catch (error) {
                                            console.error('Error uploading images:', error);
                                            toast({
                                                title: "Error",
                                                description: error instanceof Error ? error.message : "Failed to upload images",
                                                variant: "destructive",
                                            });
                                        }
                                    }}
                                    className="hidden"
                                    id="image-upload"
                                />
                            </div>
                        </FormControl>
                        <FormDescription>
                            Upload multiple images for your post or select from the media gallery. Each image should be less than 5MB.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Dialog
                open={isGalleryOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsGalleryOpen(false);
                        setGalleryMedia([]);
                    }
                }}
            >
                <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Select Images from Gallery</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 py-4">
                        {isLoadingMedia ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                                    <p className="text-sm text-muted-foreground">Loading media gallery...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto pr-4 -mr-4">
                                <MediaGrid
                                    items={galleryMedia}
                                    selectable
                                    selectedItems={galleryMedia
                                        .filter(media => (form.getValues('images') || []).includes(media.url))
                                        .map(media => media.id)}
                                    onSelect={handleGallerySelect}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="border-t pt-4">
                        <Button type="button" onClick={() => setIsGalleryOpen(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}