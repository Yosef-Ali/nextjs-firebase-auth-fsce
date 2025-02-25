import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PostFormData } from './PostForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { mediaService } from '@/app/services/media';
import Image from 'next/image';

interface PostImagesFieldProps {
    form: UseFormReturn<PostFormData>;
}

export function PostImagesField({ form }: PostImagesFieldProps) {
    const { user } = useAuth();
    const { toast } = useToast();
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
            console.log('Starting upload for file:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;

            const mediaData = {
                name: fileName,
                description: '',
                type: 'image',
                tags: [],
                alt: '',
                caption: '',
                uploadedBy: user.uid,
                uploadedByEmail: user.email || '',
            };

            console.log('Attempting upload with mediaService...');

            // Add try-catch specifically for the mediaService call
            try {
                const result = await mediaService.uploadMedia(file, mediaData);
                console.log('mediaService.uploadMedia response:', result);

                if (!result?.url) {
                    throw new Error('Upload completed but no URL was returned');
                }

                console.log('Upload successful, URL:', result.url);
                return result.url;
            } catch (serviceError) {
                console.error('mediaService.uploadMedia error:', {
                    error: serviceError,
                    message: serviceError instanceof Error ? serviceError.message : 'Unknown error',
                    stack: serviceError instanceof Error ? serviceError.stack : undefined
                });
                throw serviceError;
            }

        } catch (error) {
            // Enhanced error logging
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

        try {
            const currentImages = form.getValues('images') || [];

            for (const file of files) {
                try {
                    console.log('Starting upload process for:', file.name);
                    const url = await uploadImageToFirebase(file);

                    console.log('Upload successful, updating form with URL:', url);
                    currentImages.push(url);
                    form.setValue('images', [...currentImages], { shouldValidate: true });

                    toast({
                        title: "Success",
                        description: `Uploaded ${file.name}`,
                    });
                } catch (error) {
                    console.error('Individual file upload error:', {
                        file: file.name,
                        error: error instanceof Error ? {
                            message: error.message,
                            stack: error.stack
                        } : 'Unknown error'
                    });

                    toast({
                        title: "Upload Failed",
                        description: error instanceof Error ? error.message : `Failed to upload ${file.name}`,
                        variant: "destructive",
                    });
                }
            }
        } catch (error) {
            console.error('Batch upload error:', {
                error: error instanceof Error ? {
                    message: error.message,
                    stack: error.stack
                } : 'Unknown error'
            });

            toast({
                title: "Error",
                description: "Failed to process image uploads",
                variant: "destructive",
            });
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
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {form.watch('images')?.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="relative group">
                        {imageErrors[imageUrl] ? (
                            <div className="w-full h-40 flex items-center justify-center bg-muted rounded-lg">
                                <span className="text-sm text-muted-foreground">Image not available</span>
                            </div>
                        ) : (
                            <Image
                                src={imageUrl}
                                alt={`Upload ${index + 1}`}
                                width={320}
                                height={160}
                                className="w-full h-40 object-cover rounded-lg"
                                onError={() => handleImageError(imageUrl)}
                                unoptimized
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(imageUrl)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                    </div>
                ))}

                <label
                    htmlFor="image-upload"
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-primary cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="text-center">
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                        ) : (
                            <>
                                <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="mt-2 text-sm text-gray-500">Upload Images</span>
                            </>
                        )}
                    </div>
                </label>
            </div>

            <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
            />
        </div>
    );
}
