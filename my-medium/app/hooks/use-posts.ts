'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Post } from '../lib/post-context'

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`
})

// Query Keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  drafts: () => [...postKeys.all, 'drafts'] as const,
}

// Fetch Functions
const fetchPosts = async (params: Record<string, any> = {}): Promise<Post[]> => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value)
  })
  
  const response = await fetch(`/api/post?${searchParams}`)
  if (!response.ok) throw new Error('Failed to fetch posts')
  
  const data = await response.json()
  return data.data || []
}

const fetchPost = async (id: string): Promise<Post> => {
  const response = await fetch(`/api/post/${id}`)
  if (!response.ok) throw new Error('Failed to fetch post')
  
  const data = await response.json()
  return data.data
}

// Hooks
export const usePosts = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: postKeys.list(params || {}),
    queryFn: () => fetchPosts(params),
  })
}

export const usePost = (id: string) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => fetchPost(id),
    enabled: !!id,
  })
}

export const useDrafts = () => {
  return useQuery({
    queryKey: postKeys.drafts(),
    queryFn: () => fetchPosts({ published: false }),
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(postData),
      })
      if (!response.ok) throw new Error('Failed to create post')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/post/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update post')
      return response.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/post/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error('Failed to delete post')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}