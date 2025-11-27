'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 400,
  className = '',
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-muted-foreground text-sm">Image not available</span>
      </div>
    )
  }

  // Build props object conditionally
  const imageProps: any = {
    src,
    alt,
    priority,
    sizes,
    className: `transition-opacity duration-300 ${
      isLoading ? 'opacity-0' : 'opacity-100'
    } ${fill ? 'object-cover' : ''}`,
    onLoad: () => setIsLoading(false),
    onError: () => setHasError(true),
    quality: 85,
    unoptimized: src.startsWith('http'),
    placeholder: "blur" as const,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
  };

  // Only add width/height if not using fill
  if (fill) {
    imageProps.fill = true;
  } else {
    imageProps.width = width;
    imageProps.height = height;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image {...imageProps} />
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  )
}