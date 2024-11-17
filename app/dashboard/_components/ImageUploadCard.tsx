'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { storage } from '@/app/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useCallback, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from "@/lib/utils"

interface ImageUploadCardProps {
  type: 'cover' | 'additional'
  aspectRatio: string
  onImageUpload: (url: string) => void
  index?: number
}

export default function ImageUploadCard({ type, aspectRatio, onImageUpload, index }: ImageUploadCardProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      const storageRef = ref(storage, `images/${file.name}-${Date.now()}`)
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snapshot.ref)
      setPreview(url)
      onImageUpload(url)
    } catch (error) {
      console.error('Error uploading file:', error)
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
    accept: { 'image/*': [] },
    multiple: false
  })

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:bg-primary/5 overflow-hidden group",
            type === 'cover' ? 'aspect-[16/9]' : 'aspect-square'
          )}
        >
          <input {...getInputProps()} />
          {preview ? (
            <div className="relative w-full h-full">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                  <p className="text-sm font-medium">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className={cn(
                    "text-primary mb-2",
                    type === 'cover' ? "h-6 w-6" : "h-4 w-4"
                  )} />
                  {type === 'cover' && index === 0 && (
                    <p className="text-sm font-medium">
                      Upload cover image
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
