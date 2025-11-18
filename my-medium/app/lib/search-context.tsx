'use client'

import React, { createContext, useState, ReactNode } from 'react'
import { Post } from '../types'

interface SearchContextType {
  searchQuery: string
  selectedTag: string | null
  setSearchQuery: (query: string) => void
  setSelectedTag: (tag: string | null) => void
  filterPosts: (posts: Post[]) => Post[]
  getAllTags: (posts: Post[]) => string[]
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  
  const filterPosts = (posts: Post[]): Post[] => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTag = !selectedTag || post.tags.includes(selectedTag)
      
      return matchesSearch && matchesTag
    })
  }

  
  const getAllTags = (posts: Post[]): string[] => {
    const tagSet = new Set<string>()
    posts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }

  return (
    <SearchContext.Provider value={{
      searchQuery,
      selectedTag,
      setSearchQuery,
      setSelectedTag,
      filterPosts,
      getAllTags
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = React.useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}
