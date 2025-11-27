'use client'

import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
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

/* ------------------------ NORMALIZER ------------------------ */
function normalizeServerPost(raw: any): Post {
  return {
    id: raw.id ?? raw._id?.toString() ?? String(Math.random()).slice(2),
    title: raw.title ?? '',
    content: raw.content ?? '',
    excerpt: raw.excerpt ?? '',
    author: raw.author ?? raw.authorName ?? raw.authorObj?.name ?? '',
    authorId:
      raw.authorId ??
      raw.author?._id?.toString() ??
      raw.authorObj?._id?.toString() ??
      '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    published: !!raw.published,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
    slug:
      raw.slug ??
      (raw.title ? raw.title.toLowerCase().replace(/\s+/g, '-') : raw.id),
    image: raw.image ?? undefined,
    views: typeof raw.views === 'number' ? raw.views : 0,
    likes: typeof raw.likes === 'number' ? raw.likes : 0,
    comments: typeof raw.comments === 'number' ? raw.comments : 0,
  }
}

/* ------------------------ PROVIDER ------------------------ */
export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ------------------------ UTILS ------------------------ */
  const getAuthHeaders = useCallback((): HeadersInit => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('auth_token')
        : null

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }, [])

  const parseJsonSafe = async <T = any>(response: Response): Promise<T | null> => {
    try {
      const type = response.headers.get('content-type') || ''
      return type.includes('application/json') ? await response.json() : null
    } catch {
      return null
    }
  }

  /* ------------------------ FETCH POSTS ------------------------ */
  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/post?page=1')
      const data = await parseJsonSafe<{ success?: boolean; data?: any[] }>(response)

      if (response.ok && data?.success && Array.isArray(data.data)) {
        setPosts(data.data.map(normalizeServerPost))
      } else {
        setPosts([])
      }
    } catch {
      setError('Failed to fetch posts')
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  /* ------------------------ FETCH DRAFTS ------------------------ */
  const fetchDrafts = useCallback(async () => {
    try {
      const userStr =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_user')
          : null

      if (!userStr) return setDrafts([])

      const user = JSON.parse(userStr)
      const validId = /^[0-9a-fA-F]{24}$/.test(user.id)

      if (!validId) return setDrafts([])

      const response = await fetch(
        `/api/post?authorId=${user.id}&published=false`,
        { headers: getAuthHeaders() }
      )

      const data = await parseJsonSafe<{ success?: boolean; data?: any[] }>(response)

      if (response.ok && data?.success && Array.isArray(data.data)) {
        setDrafts(data.data.map(normalizeServerPost))
      } else {
        setDrafts([])
      }
    } catch {
      setDrafts([])
    }
  }, [getAuthHeaders])

  useEffect(() => {
    fetchDrafts()
    const interval = setInterval(fetchDrafts, 5000)
    return () => clearInterval(interval)
  }, [fetchDrafts])

  /* ------------------------ CREATE DRAFT ------------------------ */
  const createDraft = useCallback(
    async (title: string, content: string): Promise<string> => {
      setError(null)
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('auth_token')
            : null

        if (!token) throw new Error('You must be logged in to save drafts.')

        const response = await fetch('/api/post', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: title.trim(),
            content,
            excerpt: content.replace(/<[^>]*>/g, '').substring(0, 200),
            published: false,
            tags: [],
          }),
        })

        const data = await parseJsonSafe<ApiResponse<Post>>(response)

        if (!response.ok || !data?.success || !data.data)
          throw new Error(data?.error || 'Failed to create draft')

        const newDraft = normalizeServerPost(data.data)
        setDrafts(prev => [newDraft, ...prev])
        return newDraft.id
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [getAuthHeaders]
  )

  /* ------------------------ UPDATE DRAFT ------------------------ */
  const updateDraft = useCallback(
    async (id: string, updates: Partial<Post>) => {
      try {
        const response = await fetch(`/api/post/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updates),
        })

        const data = await parseJsonSafe<ApiResponse<Post>>(response)

        if (response.ok && data?.success && data.data) {
          return setDrafts(prev =>
            prev.map(d =>
              d.id === id ? { ...normalizeServerPost(data.data) } : d
            )
          )
        }
      } catch {
        setError('Failed to update draft')
      }

      setDrafts(prev =>
        prev.map(d =>
          d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d
        )
      )
    },
    [getAuthHeaders]
  )

  /* ------------------------ PUBLISH POST ------------------------ */
  const publishPost = useCallback(
    async (id: string, tags: string[], image?: string) => {
      try {
        if (!/^[0-9a-fA-F]{24}$/.test(id))
          throw new Error('Invalid draft ID')

        const response = await fetch(`/api/post/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            published: true,
            tags,
            image: image || null,
          }),
        })

        const data = await parseJsonSafe<ApiResponse<Post>>(response)

        if (!response.ok || !data?.success || !data.data)
          throw new Error(data?.error || 'Publish failed')

        const post = normalizeServerPost(data.data)
        setPosts(prev => [post, ...prev])
        setDrafts(prev => prev.filter(d => d.id !== id))
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [getAuthHeaders]
  )

  /* ------------------------ DELETE ------------------------ */
  const updatePost = useCallback(
    (id: string, updates: Partial<Post>) => {
      setPosts(prev =>
        prev.map(p =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
        )
      )
    },
    []
  )

  const deletePost = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/post/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        })

        if (response.ok) {
          setPosts(prev => prev.filter(p => p.id !== id))
          setDrafts(prev => prev.filter(d => d.id !== id))
        }
      } catch {
        setError('Failed to delete post')
      }
    },
    [getAuthHeaders]
  )

  const deleteDraft = useCallback(
    (id: string) =>
      setDrafts(prev => prev.filter(d => d.id !== id)),
    []
  )

  /* ------------------------ GETTERS ------------------------ */
  const getDraftById = useCallback(
    (id: string) => drafts.find(d => d.id === id),
    [drafts]
  )

  const getPostById = useCallback(
    (id: string) => posts.find(p => p.id === id),
    [posts]
  )

  const getPostBySlug = useCallback(
    (slug: string) => posts.find(p => p.slug === slug),
    [posts]
  )

  const refreshPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/post?page=1')
      const data = await parseJsonSafe<{ success?: boolean; data?: any[] }>(response)

      if (response.ok && data?.success && Array.isArray(data.data)) {
        setPosts(data.data.map(normalizeServerPost))
      }
    } catch {
      setError('Failed to refresh posts')
    }
  }, [])

  /* ------------------------ RETURN PROVIDER ------------------------ */
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

/* ------------------------ HOOK ------------------------ */
export function usePosts() {
  const context = React.useContext(PostContext)
  if (!context) throw new Error('usePosts must be used within PostProvider')
  return context
}
