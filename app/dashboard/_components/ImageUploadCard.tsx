'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useCallback, useState, useEffect } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/providers/AuthProvider"
import { toast } from "@/components/ui/use-toast"

interface ImageUploadCardProps {
  type: 'cover' | 'additional'
  aspectRatio: string
  onImageUpload: (url: string) => void
  initialImage?: string
  index?: number
}

export default function ImageUploadCard({ type, aspectRatio, onImageUpload, initialImage, index }: ImageUploadCardProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(initialImage || null)
  const { user } = useAuth()

  useEffect(() => {
    if (initialImage) {
      setPreview(initialImage)
    }
  }, [initialImage])

  const handleUpload = async (file: File) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upload images",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      setUploading(true)
      const fileName = `${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}-${Date.now()}`
      const storageRef = ref(storage, `images/${fileName}`)
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snapshot.ref)
      setPreview(url)
      onImageUpload(url)

      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      handleUpload(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  })

  const removeImage = () => {
    setPreview(null)
    onImageUpload('')
  }

  return (
    <Card className="relative">
      <CardContent className="p-3">
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed border-gray-200 rounded-lg transition-all",
            "hover:border-gray-400 cursor-pointer",
            aspectRatio,
            "flex items-center justify-center"
          )}
        >
          <input {...getInputProps()} />
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Uploaded"
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : uploading ? (
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400 animate-bounce" />
              <p className="mt-2 text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {type === 'cover' ? 'Upload cover image' : `Upload image ${index ? index + 1 : ''}`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Click or drag and drop • Max 5MB
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
