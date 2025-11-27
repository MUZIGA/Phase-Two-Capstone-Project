'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`
})

export const commentKeys = {
  all: ['comments'] as const,
  byPost: (postId: string) => [...commentKeys.all, 'post', postId] as const,
}

const fetchComments = async (postId: string) => {
  const response = await fetch(`/api/post/${postId}/comments`)
  if (!response.ok) throw new Error('Failed to fetch comments')
  
  const data = await response.json()
  return data.data || []
}

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: commentKeys.byPost(postId),
    queryFn: () => fetchComments(postId),
    enabled: !!postId && postId.length === 24,
  })
}

export const useAddComment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ postId, content, parentId }: { 
      postId: string; 
      content: string; 
      parentId?: string 
    }) => {
      const response = await fetch(`/api/post/${postId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, parentId }),
      })
      if (!response.ok) throw new Error('Failed to add comment')
      return response.json()
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(postId) })
    },
  })
}

export const useLikeComment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ commentId }: { commentId: string; postId: string }) => {
      const response = await fetch(`/api/comment/${commentId}/like`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error('Failed to like comment')
      return response.json()
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(postId) })
    },
  })
}