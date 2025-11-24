'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100
}: UseInfiniteScrollOptions) {
  const [isFetching, setIsFetching] = useState(false)

  const handleScroll = useCallback(() => {
    if (isLoading || isFetching || !hasMore) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    // Check if user has scrolled near the bottom
    if (scrollTop + windowHeight >= documentHeight - threshold) {
      setIsFetching(true)
      onLoadMore()
    }
  }, [hasMore, isLoading, isFetching, onLoadMore, threshold])

  useEffect(() => {
    if (!isFetching) return

    const timer = setTimeout(() => {
      setIsFetching(false)
    }, 1000) // Prevent rapid firing

    return () => clearTimeout(timer)
  }, [isFetching])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { isFetching }
}
