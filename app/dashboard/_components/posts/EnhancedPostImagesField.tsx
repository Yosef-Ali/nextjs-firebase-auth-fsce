import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PostFormData } from './PostForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import Image from 'next/image';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Trash, Upload, ImageIcon } from 'lucide-react';

interface EnhancedPostImagesFieldProps {
    form: UseFormReturn<PostFormData>;
}

export function EnhancedPostImagesField({ form }: EnhancedPostImagesFieldProps) {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

    const uploadImageToFirebase = async (file: File): Promise<string> => {
        if (!user?.uid) {
            throw new Error('You must be logged in to upload images.');
        }

        if (!file) {
            throw new Error('No file provided for upload.');
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error(`Invalid file type: ${file.type}. Please upload an image.`);
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit.`);
        }

        try {
            // Create a unique filename with timestamp and random string
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 10);
            const safeFileName = file.name.replace(/[^\w.-]/g, '-');
            const fileName = `posts/${user.uid}-${timestamp}-${randomString}-${safeFileName}`;
            
            console.log('Creating storage reference for:', fileName);
            const storageRef = ref(storage, fileName);

            // Upload with metadata
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    uploadedBy: user.uid,
                    originalName: file.name
                }
            };

            // Upload the file
            const uploadResult = await uploadBytes(storageRef, file, metadata);
            console.log('Upload successful:', uploadResult);

            // Get the download URL
            const url = await getDownloadURL(uploadResult.ref);
            console.log('Download URL:', url);
            
            return url;
        } catch (error) {
            console.error('Upload error details:', {
                errorType: error?.constructor?.name,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorStack: error instanceof Error ? error.stack : undefined,
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type
                },
                user: {
                    uid: user.uid,
                    email: user.email
                }
            });

            if (error instanceof Error) {
                throw new Error(`Upload failed: ${error.message}`);
            } else {
                throw new Error('Upload failed: Unknown error occurred');
            }
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        toast.info(`Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`);

        try {
            const currentImages = form.getValues('images') || [];
            const successfulUploads = [];

            for (const file of files) {
                try {
                    console.log('Starting upload process for:', file.name);
                    const url = await uploadImageToFirebase(file);
                    successfulUploads.push(url);
                } catch (error) {
                    console.error('Individual file upload error:', {
                        file: file.name,
                        error: error instanceof Error ? {
                            message: error.message,
                            stack: error.stack
                        } : 'Unknown error'
                    });

                    toast.error(error instanceof Error ? error.message : `Failed to upload ${file.name}`);
                }
            }

            if (successfulUploads.length > 0) {
                const newImages = [...currentImages, ...successfulUploads];
                form.setValue('images', newImages, { shouldValidate: true });
                
                toast.success(`Successfully uploaded ${successfulUploads.length} image${successfulUploads.length > 1 ? 's' : ''}`);
            }
        } catch (error) {
            console.error('Batch upload error:', {
                error: error instanceof Error ? {
                    message: error.message,
                    stack: error.stack
                } : 'Unknown error'
            });

            toast.error("Failed to process image uploads");
        } finally {
            setIsUploading(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleImageError = (imageUrl: string) => {
        setImageErrors(prev => ({
            ...prev,
            [imageUrl]: true
        }));
    };

    const handleRemoveImage = (imageUrl: string) => {
        const currentImages = form.getValues('images') || [];
        const newImages = currentImages.filter(url => url !== imageUrl);
        form.setValue('images', newImages, { shouldValidate: true });
        setImageErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[imageUrl];
            return newErrors;
        });
        toast.success("Image removed");
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {form.watch('images')?.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="relative group aspect-square">
                        {imageErrors[imageUrl] ? (
                            <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground ml-2">Image not available</span>
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                <Image
                                    src={imageUrl}
                                    alt={`Upload ${index + 1}`}
                                    fill
                                    className="object-cover rounded-lg"
                                    onError={() => handleImageError(imageUrl)}
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                />
                                <Button
                                    type="button"
                                    onClick={() => handleRemoveImage(imageUrl)}
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}

                <label
                    htmlFor="post-images-upload"
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-primary cursor-pointer transition-colors aspect-square ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="text-center">
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                <span className="mt-2 text-sm text-gray-500">Add Images</span>
                            </>
                        )}
                    </div>
                </label>
            </div>

            <input
                type="file"
                id="post-images-upload"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
            />
        </div>
    );
}
