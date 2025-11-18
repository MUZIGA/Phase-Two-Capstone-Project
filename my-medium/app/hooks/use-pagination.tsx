'use client'

import { useState, useMemo } from 'react'

interface UsePaginationOptions {
  items: any[]
  itemsPerPage?: number
}

export function usePagination({ items, itemsPerPage = 10 }: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(1)

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = items.slice(startIndex, endIndex)

    return {
      currentItems,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    }
  }, [items, itemsPerPage, currentPage])

  return {
    ...paginationData,
    goToPage: setCurrentPage,
    nextPage: () => setCurrentPage(p => p + 1),
    previousPage: () => setCurrentPage(p => p - 1)
  }
}
