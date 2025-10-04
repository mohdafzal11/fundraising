"use client"

import { useState, useCallback } from 'react'
import { Loader2, X, Upload } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useDropzone } from 'react-dropzone'
import { getPageUrl } from '@/lib/utils'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function ImageUpload({
  value,
  onChange,
  disabled
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { toast } = useToast()

  const handleUpload = useCallback(async (file: File) => {
    try {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      // Use the UPLOAD_TARGET_URL environment variable if available, otherwise fall back to the API route
      const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_TARGET_URL || process.env.UPLOAD_TARGET_URL || getPageUrl('/api/upload')
      console.log('Using upload URL:', uploadUrl)
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (error: any) {
      console.error('Error uploading image:', error)
      const errorMessage = error.message || "There was an error uploading your image. Please try again.";
      setUploadError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }, [onChange, toast])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      handleUpload(acceptedFiles[0])
    }
  }, [handleUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    disabled: disabled || isUploading
  })

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      <div 
        {...getRootProps()} 
        className={`w-full border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border'
        } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} disabled={disabled || isUploading} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to select'}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, GIF (max 5MB)
              </p>
            </>
          )}
        </div>
      </div>
      
      {uploadError && (
        <div className="w-full p-2 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
          {uploadError}
        </div>
      )}
      
      {value && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
          <Image
            fill
            className="object-cover"
            alt="Event image"
            src={value && value.length > 0 ? value : ''}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange('')}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}