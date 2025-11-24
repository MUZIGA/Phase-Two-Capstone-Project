/* eslint-disable @typescript-eslint/no-explicit-any */
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
  createdAt: Date | string
  updatedAt: Date | string
  slug: string
  image?: string
  views?: number
  likes?: number
}

export type Draft = Post

interface ErrorResponse {
  error?: string
}

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

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Helpers ---
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('auth_token')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  const parseJsonSafe = async <T = any>(response: Response): Promise<T | null> => {
    try {
      return (await response.json()) as T
    } catch {
      return null
    }
  }

  // --- Fetch Posts ---
  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/post?page=1')
      if (!response.ok) throw new Error(`Failed to fetch posts: ${response.statusText}`)

      const data = await response.json()
      if (data?.success && data.data) {
        setPosts(
          data.data.map((post: any) => ({
            ...post,
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
          }))
        )
      }
    } catch {
      setError('Failed to fetch posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  // --- Fetch Drafts ---
  const fetchDrafts = async () => {
    try {
      const storedUser = localStorage.getItem('auth_user')
      if (!storedUser) return setDrafts([])

      const user = JSON.parse(storedUser)
      const response = await fetch(`/api/post?authorId=${user.id}&published=false`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) return setDrafts([])

      const data = await response.json()
      if (data?.success && data.data) {
        setDrafts(
          data.data.map((draft: any) => ({
            ...draft,
            createdAt: new Date(draft.createdAt),
            updatedAt: new Date(draft.updatedAt),
          }))
        )
      } else setDrafts([])
    } catch {
      setError('Failed to fetch drafts')
      setDrafts([])
    }
  }

  useEffect(() => {
    fetchDrafts()
    const interval = setInterval(fetchDrafts, 5000)
    return () => clearInterval(interval)
  }, [])

  // --- Create Draft ---
  const createDraft = async (title: string, content: string, authorId: string, author: string): Promise<string> => {
    setError(null)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('You must be logged in to save drafts.')

      const response = await fetch('/api/post', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          content,
          excerpt: content.replace(/<[^>]*>/g, '').substring(0, 150),
          published: false,
          tags: [],
        }),
      })

      if (!response.ok) {
        const errData: ErrorResponse | null = await parseJsonSafe(response)
        throw new Error(errData?.error || `Failed to create draft: ${response.status}`)
      }

      const data = await response.json()
      if (data?.success && data.data) {
        const newDraft: Draft = {
          ...data.data,
          author,
          authorId,
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
        }
        setDrafts(prev => [newDraft, ...prev])
        return data.data.id
      }

      throw new Error('Invalid response from server')
    } catch (err: any) {
      setError(err.message)
      // fallback draft: cannot be published until saved on server
      const id = '0.' + Math.random().toString().slice(2)
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
        likes: 0,
      }
      setDrafts(prev => [newDraft, ...prev])
      return id
    }
  }

  // --- Update Draft ---
  const updateDraft = async (id: string, updates: Partial<Post>) => {
    setError(null)
    try {
      const response = await fetch(`/api/post/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        if (data?.success && data.data) {
          setDrafts(prev =>
            prev.map(d => (d.id === id ? { ...d, ...data.data, updatedAt: new Date(data.data.updatedAt) } : d))
          )
          return
        }
      }
    } catch {
      setError('Failed to update draft')
    }

    // fallback
    setDrafts(prev => prev.map(d => (d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d)))
  }

  // --- Publish Post ---
  const publishPost = async (id: string, tags: string[], image?: string) => {
    if (!id || id.startsWith('0.')) {
      throw new Error('Cannot publish draft: Draft has not been saved to server yet.')
    }

    setError(null)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('You must be logged in to publish posts.')

      const response = await fetch(`/api/post/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ published: true, tags, image }),
      })

      const data = await parseJsonSafe<{ success: boolean; data?: Post; error?: string }>(response)

      if (!response.ok) {
        throw new Error(data?.error || `Failed to publish post: ${response.status} ${response.statusText}`)
      }

      if (!(data?.success && data?.data)) throw new Error('Invalid response from server while publishing.')

      setPosts(prev => [
         { ...data.data, createdAt: new Date(data.data.createdAt), updatedAt: new Date(data.data.updatedAt) },
         ...prev,
       ])
      deleteDraft(id)
    } catch (err: any) {
      setError(err?.message || 'Failed to publish post')
      throw err
    }
  }

  // --- Local Updates ---
  const updatePost = (id: string, updates: Partial<Post>) =>
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)))

  const deletePost = (id: string) => setPosts(prev => prev.filter(p => p.id !== id))
  const deleteDraft = (id: string) => setDrafts(prev => prev.filter(d => d.id !== id))
  const getDraftById = (id: string) => drafts.find(d => d.id === id)
  const getPostById = (id: string) => posts.find(p => p.id === id)
  const getPostBySlug = (slug: string) => posts.find(p => p.slug === slug)

  const refreshPosts = async () => {
    try {
      const response = await fetch('/api/post?page=1')
      if (!response.ok) throw new Error('Failed to refresh posts')

      const data = await response.json()
      if (data?.success && data.data) {
        setPosts(
          data.data.map((post: any) => ({
            ...post,
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
          }))
        )
      }
    } catch {
      setError('Failed to refresh posts')
    }
  }

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
