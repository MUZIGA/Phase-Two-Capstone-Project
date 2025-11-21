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

export interface Draft extends Post {}

// Define Post Context type
interface PostContextType {
  posts: Post[]
  drafts: Draft[]
  isLoading: boolean
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

  // Fetch published posts from API
  useEffect(() => {
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
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Fetch user's drafts (unpublished posts) when user is logged in
  useEffect(() => {
    const fetchUserDrafts = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user')
        if (!storedUser) {
          setDrafts([])
          return
        }

        const user = JSON.parse(storedUser)
        const token = localStorage.getItem('auth_token')
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // Fetch user's unpublished posts
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
      } catch (error) {
        console.error('Failed to fetch drafts:', error)
        setDrafts([])
      }
    }

    // Check for user changes periodically and on mount
    fetchUserDrafts()
    const interval = setInterval(fetchUserDrafts, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  
  const createDraft = async (title: string, content: string, authorId: string, author: string): Promise<string> => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        throw new Error('You must be logged in to save drafts. Please log in and try again.')
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }

      const response = await fetch('/api/post', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          content,
          excerpt: content.replace(/<[^>]*>/g, '').substring(0, 150),
          published: false,
          tags: [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        
        // If unauthorized, the user might not be logged in
        if (response.status === 401) {
          throw new Error('Please log in to save drafts. Your session may have expired.')
        }
        
        throw new Error(errorData.error || `Failed to create draft: ${response.status} ${response.statusText}`)
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
        setDrafts([newDraft, ...drafts])
        return data.data.id
      }
      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Failed to create draft:', error)
      // Fallback to local storage if API fails
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
  }


  const updateDraft = async (id: string, updates: Partial<Post>) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/post/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setDrafts(drafts.map(draft => 
            draft.id === id 
              ? { ...draft, ...data.data, updatedAt: new Date(data.data.updatedAt) }
              : draft
          ))
          return
        }
      }
    } catch (error) {
      console.error('Failed to update draft:', error)
    }

    // Fallback to local update
    setDrafts(drafts.map(draft => 
      draft.id === id 
        ? { ...draft, ...updates, updatedAt: new Date() }
        : draft
    ))
  }

  
  const publishPost = async (id: string, tags: string[], image?: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/post/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          published: true,
          tags,
          image,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const publishedPost: Post = {
            ...data.data,
            createdAt: new Date(data.data.createdAt),
            updatedAt: new Date(data.data.updatedAt),
          }
          setPosts([publishedPost, ...posts])
          deleteDraft(id)
          return
        }
      }
    } catch (error) {
      console.error('Failed to publish post:', error)
    }

    // Fallback to local update
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

  
  const deleteDraft = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/post/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        setDrafts(drafts.filter(draft => draft.id !== id))
        return
      }
    } catch (error) {
      console.error('Failed to delete draft:', error)
    }

    // Fallback to local delete
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
      getPostBySlug,
      isLoading,
      refreshPosts: async () => {
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
        } catch (error) {
          console.error('Failed to refresh posts:', error)
        }
      }
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
