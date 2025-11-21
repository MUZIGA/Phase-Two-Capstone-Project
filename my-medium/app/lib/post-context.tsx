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

// Context type
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

  // Fetch published posts
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/post?page=1')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setPosts(data.data.map((post: any) => ({
            ...post,
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
          })))
        }
      }
    } catch (err) {
      setError('Failed to fetch posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Fetch drafts for current user
  const fetchDrafts = async () => {
    try {
      const storedUser = localStorage.getItem('auth_user')
      if (!storedUser) {
        setDrafts([])
        return
      }

      const user = JSON.parse(storedUser)
      const token = localStorage.getItem('auth_token')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`/api/post?authorId=${user.id}&published=false`, { headers })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setDrafts(data.data.map((draft: any) => ({
            ...draft,
            createdAt: new Date(draft.createdAt),
            updatedAt: new Date(draft.updatedAt),
          })))
        } else {
          setDrafts([])
        }
      } else {
        setDrafts([])
      }
    } catch (err) {
      setError('Failed to fetch drafts')
      setDrafts([])
    }
  }

  useEffect(() => {
    fetchDrafts()
    const interval = setInterval(fetchDrafts, 5000)
    return () => clearInterval(interval)
  }, [])

  // Create a draft
  const createDraft = async (title: string, content: string, authorId: string, author: string): Promise<string> => {
    setError(null)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('You must be logged in to save drafts.')

      const response = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          content,
          excerpt: content.replace(/<[^>]*>/g, '').substring(0, 150),
          published: false,
          tags: [],
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Failed to create draft: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.data) {
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
      // fallback to local draft
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
        likes: 0,
      }
      setDrafts(prev => [newDraft, ...prev])
      return id
    }
  }

  // Update draft
  const updateDraft = async (id: string, updates: Partial<Post>) => {
    setError(null)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/post/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setDrafts(prev =>
            prev.map(d => (d.id === id ? { ...d, ...data.data, updatedAt: new Date(data.data.updatedAt) } : d))
          )
          return
        }
      }
    } catch (err) {
      setError('Failed to update draft')
    }

    // fallback local update
    setDrafts(prev =>
      prev.map(d => (d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d))
    )
  }

  // Publish post
  const publishPost = async (id: string, tags: string[], image?: string) => {
    setError(null)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/post/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ published: true, tags, image }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const publishedPost: Post = {
            ...data.data,
            createdAt: new Date(data.data.createdAt),
            updatedAt: new Date(data.data.updatedAt),
          }
          setPosts(prev => [publishedPost, ...prev])
          deleteDraft(id)
          return
        }
      }
    } catch (err) {
      setError('Failed to publish post')
    }

    // fallback local publish
    const draft = drafts.find(d => d.id === id)
    if (!draft) return
    const publishedPost: Post = { ...draft, tags, image, published: true, updatedAt: new Date() }
    setPosts(prev => [publishedPost, ...prev])
    deleteDraft(id)
  }

  // Local updates
  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)))
  }

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id))
  }

  const getDraftById = (id: string) => drafts.find(d => d.id === id)
  const getPostById = (id: string) => posts.find(p => p.id === id)
  const getPostBySlug = (slug: string) => posts.find(p => p.slug === slug)

  const refreshPosts = async () => {
    try {
      const response = await fetch('/api/post?page=1')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setPosts(data.data.map((post: any) => ({
            ...post,
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
          })))
        }
      }
    } catch (err) {
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
