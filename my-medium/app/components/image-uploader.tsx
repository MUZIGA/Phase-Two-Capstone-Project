'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface ImageUploaderProps {
  onImageSelected: (imageData: string) => void
}

export function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }


    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      setPreview(imageData)
      onImageSelected(imageData)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-input rounded-lg p-8 text-center cursor-pointer hover:border-primary transition"
      >
        {preview ? (
          <div className="space-y-2">
            <img 
              src={preview || "/placeholder.svg"} 
              alt="Preview" 
              className="max-h-48 mx-auto rounded"
            />
            <p className="text-sm text-muted-foreground">
              Click to change image
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl">📸</p>
            <p className="font-medium text-foreground">
              Click to upload featured image
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, GIF (max 5MB)
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setPreview(null)
            onImageSelected('')
          }}
        >
          Remove Image
        </Button>
      )}
    </div>
  )
}
