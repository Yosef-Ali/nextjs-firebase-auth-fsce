'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { storage } from '@/app/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useCallback, useState, useEffect } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from "@/lib/utils"
import { toast } from 'sonner'

interface FileUploadCardProps {
  onFileUpload: (url: string, name: string) => void
  initialFile?: string
  accept?: Record<string, string[]>
}

export default function FileUploadCard({ onFileUpload, initialFile, accept }: FileUploadCardProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(
    initialFile ? { url: initialFile, name: 'Current file' } : null
  )

  useEffect(() => {
    if (initialFile) {
      setPreview({ url: initialFile, name: 'Current file' })
    }
  }, [initialFile])

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)

      // Validate file size (16MB limit)
      if (file.size > 16 * 1024 * 1024) {
        throw new Error('File size exceeds 16MB limit')
      }

      const storageRef = ref(storage, `resources/${file.name}-${Date.now()}`)
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snapshot.ref)
      setPreview({ url, name: file.name })
      onFileUpload(url, file.name)
      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
      setPreview(null)
      onFileUpload('', '')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      await handleUpload(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'audio/mpeg': ['.mp3'],
      'video/mp4': ['.mp4'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false,
    maxSize: 16 * 1024 * 1024 // 16MB
  })

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onFileUpload('', '')
    toast.success('File removed')
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {preview ? (
          <div className="relative flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg group">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{preview.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ready to use</p>
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ) : (
          <div {...getRootProps()} className="border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out">
            <input {...getInputProps()} />
            <div className="p-6 flex flex-col items-center justify-center">
              <div className={cn(
                "h-6 w-6 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 p-3",
                uploading && "animate-spin"
              )}>
                {uploading ? (
                  <div className="h-full w-full border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Upload className="h-full w-full text-primary" />
                )}
              </div>
              <p className="text-sm font-medium mb-1">
                {uploading ? 'Uploading...' : isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF, Word, Excel, PowerPoint, MP3, MP4, JPG, PNG up to 16MB
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
