'use client'

import React, { createContext, useState, ReactNode, useEffect } from 'react'


export interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  authorId: string
  tags: string[]
  published: boolean
  createdAt: Date
  updatedAt: Date
  slug: string
  image?: string
  views?: number
  likes?: number
}

// Define Post Context type
interface PostContextType {
  posts: Post[]
  drafts: Draft[]
  createDraft: (title: string, content: string, authorId: string, author: string) => string
  updateDraft: (id: string, updates: Partial<Draft>) => void
  publishPost: (id: string, tags: string[], image?: string) => void
  updatePost: (id: string, updates: Partial<Post>) => void
  deletePost: (id: string) => void
  deleteDraft: (id: string) => void
  getDraftById: (id: string) => Draft | undefined
  getPostById: (id: string) => Post | undefined
  getPostBySlug: (slug: string) => Post | undefined
}

export const PostContext = createContext<PostContextType | undefined>(undefined)

const DRAFTS_STORAGE_KEY = 'writehub_drafts'

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(DRAFTS_STORAGE_KEY)
      if (stored) {
        const parsed: Draft[] = JSON.parse(stored).map((draft: Draft) => ({
          ...draft,
          createdAt: new Date(draft.createdAt),
          updatedAt: new Date(draft.updatedAt),
        }))
        setDrafts(parsed)
      }
    } catch (error) {
      console.error('Failed to load drafts from storage', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        DRAFTS_STORAGE_KEY,
        JSON.stringify(
          drafts.map((draft) => ({
            ...draft,
            createdAt: draft.createdAt instanceof Date ? draft.createdAt.toISOString() : draft.createdAt,
            updatedAt: draft.updatedAt instanceof Date ? draft.updatedAt.toISOString() : draft.updatedAt,
          }))
        )
      )
    } catch (error) {
      console.error('Failed to save drafts to storage', error)
    }
  }, [drafts])

  
  const createDraft = (title: string, content: string, authorId: string, author: string): string => {
    const id = Math.random().toString()
    const now = new Date()
    
    const newDraft: Post = {
      id,
      title,
      content,
      excerpt: content.replace(/<[^>]*>/g, '').substring(0, 150),
      author,
      authorId,
      tags: [],
      published: false,
      createdAt: now,
      updatedAt: now,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      views: 0,
      likes: 0
    }

    setDrafts([newDraft, ...drafts])
    return id
  }


  const updateDraft = (id: string, updates: Partial<Post>) => {
    setDrafts(drafts.map(draft => 
      draft.id === id 
        ? { ...draft, ...updates, updatedAt: new Date() }
        : draft
    ))
  }

  
  const publishPost = (id: string, tags: string[], image?: string) => {
    const draft = drafts.find(d => d.id === id)
    if (!draft) return

    const publishedPost: Post = {
      ...draft,
      tags,
      image,
      published: true,
      updatedAt: new Date()
    }

    setPosts([publishedPost, ...posts])
    deleteDraft(id)
  }

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts(posts.map(post =>
      post.id === id
        ? { ...post, ...updates, updatedAt: new Date() }
        : post
    ))
  }

  
  const deletePost = (id: string) => {
    setPosts(posts.filter(post => post.id !== id))
  }

  
  const deleteDraft = (id: string) => {
    setDrafts(drafts.filter(draft => draft.id !== id))
  }


  const getDraftById = (id: string): Draft | undefined => {
    return drafts.find(draft => draft.id === id)
  }

  // Get a post by ID
  const getPostById = (id: string): Post | undefined => {
    return posts.find(post => post.id === id)
  }

  // Get a post by slug (URL-friendly name)
  const getPostBySlug = (slug: string): Post | undefined => {
    return posts.find(post => post.slug === slug)
  }

  return (
    <PostContext.Provider value={{ 
      posts, 
      drafts, 
      createDraft, 
      updateDraft,
      publishPost,
      updatePost,
      deletePost,
      deleteDraft,
      getDraftById,
      getPostById,
      getPostBySlug
    }}>
      {children}
    </PostContext.Provider>
  )
}

export function usePosts() {
  const context = React.useContext(PostContext)
  if (context === undefined) {
    throw new Error('usePosts must be used within PostProvider')
  }
  return context
}
