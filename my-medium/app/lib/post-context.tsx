
'use client'

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react'
import type { Post, ApiResponse } from './types'

export type { Post }

export type Draft = Post

interface PostContextType {
  posts: Post[]
  drafts: Draft[]
  isLoading: boolean
  error: string | null
  setError: (err: string | null) => void
  createDraft: (title: string, content: string, authorId: string, author: string) => Promise<string>
  updateDraft: (id: string, updates: Partial<Draft>) => Promise<void>
  publishPost: (id: string, tags: string[], image?: string) => Promise<void>
  updatePost: (id: string, updates: Partial<Post>) => void
  deletePost: (id: string) => void
  deleteDraft: (id: string) => void
  getDraftById: (id: string) => Draft | undefined
  getPostById: (id: string) => Post | undefined
  getPostBySlug: (slug: string) => Post | undefined
  refreshPosts: () => Promise<void>
}

export const PostContext = createContext<PostContextType | undefined>(undefined)

function normalizeServerPost(raw: any): Post {
  const id = raw.id ?? raw._id?.toString() ?? String(Math.random()).slice(2)
  const createdAt = raw.createdAt ? new Date(raw.createdAt) : new Date()
  const updatedAt = raw.updatedAt ? new Date(raw.updatedAt) : createdAt
  const author = raw.author ?? raw.authorName ?? (raw.authorObj?.name ?? '')
  const authorId = raw.authorId ?? raw.author?._id?.toString() ?? raw.authorObj?._id?.toString() ?? ''
  const slug = raw.slug ?? (raw.title ? raw.title.toLowerCase().replace(/\s+/g, '-') : id)

  return {
    id,
    title: raw.title ?? '',
    content: raw.content ?? '',
    excerpt: raw.excerpt ?? '',
    author,
    authorId,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    published: !!raw.published,
    createdAt,
    updatedAt,
    slug,
    image: raw.image ?? undefined,
    views: typeof raw.views === 'number' ? raw.views : 0,
    likes: typeof raw.likes === 'number' ? raw.likes : 0,
  }
}

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = useCallback((): HeadersInit => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      return headers
    } catch {
      return { 'Content-Type': 'application/json' }
    }
  }, [])

  const parseJsonSafe = async <T = any>(response: Response): Promise<T | null> => {
    try {
      const ct = response.headers.get('content-type') || ''
      if (!ct.includes('application/json')) return null
      return (await response.json()) as T
    } catch {
      return null
    }
  }

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/post?page=1')
      if (!response.ok) throw new Error(`Failed to fetch posts: ${response.statusText}`)
      const data = await parseJsonSafe<{ success?: boolean; data?: any[] }>(response)
      if (data?.success && Array.isArray(data.data)) {
        setPosts(data.data.map(normalizeServerPost))
      } else {
        setPosts([])
      }
    } catch (err: any) {
      console.error('fetchPosts error', err)
      setError('Failed to fetch posts')
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const fetchDrafts = useCallback(async () => {
    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
      if (!storedUser) {
        setDrafts([])
        return
      }
      const user = JSON.parse(storedUser)
      if (!user.id || typeof user.id !== 'string' || user.id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(user.id)) {
        setDrafts([])
        return
      }
      const response = await fetch(`/api/post?authorId=${encodeURIComponent(user.id)}&published=false`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        setDrafts([])
        return
      }
      const data = await parseJsonSafe<{ success?: boolean; data?: any[] }>(response)
      if (data?.success && Array.isArray(data.data)) {
        setDrafts(data.data.map(normalizeServerPost))
      } else {
        setDrafts([])
      }
    } catch (err) {
      // Silently fail for invalid draft requests
      setDrafts([])
    }
  }, [getAuthHeaders])

  useEffect(() => {
    fetchDrafts()
    const interval = setInterval(fetchDrafts, 5000)
    return () => clearInterval(interval)
  }, [fetchDrafts])

  const createDraft = useCallback(
    async (title: string, content: string, authorId: string, author: string): Promise<string> => {
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!token) throw new Error('You must be logged in to save drafts.')

        const response = await fetch('/api/post', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: title.trim(),
            content,
            excerpt: content.replace(/<[^>]*>/g, '').substring(0, 200).trim(),
            published: false,
            tags: [],
          }),
        })

        if (!response.ok) {
          const errData = await parseJsonSafe<ApiResponse>(response)
          throw new Error(errData?.error || `Failed to create draft: ${response.status}`)
        }

        const data = await parseJsonSafe<ApiResponse<Post>>(response)
        if (data?.success && data.data) {
          const newDraft = normalizeServerPost(data.data)
          setDrafts(prev => [newDraft, ...prev])
          return newDraft.id
        }

        throw new Error('Invalid response from server')
      } catch (err: any) {
        console.error('createDraft error', err)
        setError(err?.message ?? 'Failed to create draft')
        throw err
      }
    },
    [getAuthHeaders]
  )

  const updateDraft = useCallback(
    async (id: string, updates: Partial<Post>) => {
      setError(null)
      try {
        const response = await fetch(`/api/post/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updates),
        })
        if (response.ok) {
          const data = await parseJsonSafe<ApiResponse<Post>>(response)
          if (data?.success && data.data) {
            setDrafts(prev =>
              prev.map(d => (d.id === id ? { ...normalizeServerPost(data.data), author: d.author, authorId: d.authorId } : d))
            )
            return
          }
        }
      } catch (err) {
        console.error('updateDraft error', err)
        setError('Failed to update draft')
      }
      setDrafts(prev => prev.map(d => (d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d)))
    },
    [getAuthHeaders]
  )

  const publishPost = useCallback(
    async (draftId: string, tags: string[], image?: string) => {
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!token) throw new Error('You must be logged in to publish posts.')

        // Validate ObjectId format
        if (!/^[0-9a-fA-F]{24}$/.test(draftId)) {
          throw new Error('Invalid draft ID format')
        }

        const response = await fetch(`/api/post/${draftId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            published: true, 
            tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
            image: image || null
          }),
        })

        const data = await parseJsonSafe<ApiResponse<Post>>(response)
        
        if (!response.ok) {
          throw new Error(data?.error || `Failed to publish: ${response.status}`)
        }
        
        if (!data?.success || !data?.data) {
          throw new Error('Invalid response from server')
        }

        const normalized = normalizeServerPost(data.data)
        setPosts(prev => [normalized, ...prev])
        setDrafts(prev => prev.filter(d => d.id !== draftId))
      } catch (err: any) {
        console.error('publishPost error', err)
        const errorMessage = err?.message || 'Failed to publish post'
        setError(errorMessage)
        throw err
      }
    },
    [getAuthHeaders]
  )

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)))
  }, [])

  const deletePost = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/post/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== id))
        setDrafts(prev => prev.filter(d => d.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      setError('Failed to delete post')
    }
  }, [getAuthHeaders])
  const deleteDraft = useCallback((id: string) => setDrafts(prev => prev.filter(d => d.id !== id)), [])
  const getDraftById = useCallback((id: string) => drafts.find(d => d.id === id), [drafts])
  const getPostById = useCallback((id: string) => posts.find(p => p.id === id), [posts])
  const getPostBySlug = useCallback((slug: string) => posts.find(p => p.slug === slug), [posts])

  const refreshPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/post?page=1')
      if (!response.ok) throw new Error('Failed to refresh posts')
      const data = await parseJsonSafe<{ success?: boolean; data?: any[] }>(response)
      if (data?.success && Array.isArray(data.data)) {
        setPosts(data.data.map(normalizeServerPost))
      }
    } catch (err) {
      console.error('refreshPosts error', err)
      setError('Failed to refresh posts')
    }
  }, [])

  return (
    <PostContext.Provider
      value={{
        posts,
        drafts,
        isLoading,
        error,
        setError,
        createDraft,
        updateDraft,
        publishPost,
        updatePost,
        deletePost,
        deleteDraft,
        getDraftById,
        getPostById,
        getPostBySlug,
        refreshPosts,
      }}
    >
      {children}
    </PostContext.Provider>
  )
}

export function usePosts() {
  const context = React.useContext(PostContext)
  if (!context) throw new Error('usePosts must be used within PostProvider')
  return context
}
