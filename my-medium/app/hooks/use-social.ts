'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`
})

export const socialKeys = {
  likes: ['likes'] as const,
  postLike: (postId: string) => [...socialKeys.likes, 'post', postId] as const,
  follows: ['follows'] as const,
  userFollow: (userId: string) => [...socialKeys.follows, 'user', userId] as const,
}

// Post Likes
const fetchPostLike = async (postId: string) => {
  const response = await fetch(`/api/post/${postId}/clap`)
  if (!response.ok) throw new Error('Failed to fetch like status')
  
  const data = await response.json()
  return { liked: data.liked, count: data.likesCount }
}

export const usePostLike = (postId: string) => {
  return useQuery({
    queryKey: socialKeys.postLike(postId),
    queryFn: () => fetchPostLike(postId),
    enabled: !!postId && postId.length === 24,
  })
}

export const useLikePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/post/${postId}/clap`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error('Failed to like post')
      return response.json()
    },
    onMutate: async (postId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: socialKeys.postLike(postId) })
      
      const previousLike = queryClient.getQueryData(socialKeys.postLike(postId)) as any
      const currentLike = previousLike || { liked: false, count: 0 }
      
      queryClient.setQueryData(socialKeys.postLike(postId), {
        liked: !currentLike.liked,
        count: currentLike.liked ? currentLike.count - 1 : currentLike.count + 1
      })
      
      return { previousLike }
    },
    onError: (_err, postId, context) => {
      // Rollback on error
      if (context?.previousLike) {
        queryClient.setQueryData(socialKeys.postLike(postId), context.previousLike)
      }
    },
    onSettled: (data, _error, postId) => {
      // Update with server response
      if (data?.data) {
        queryClient.setQueryData(socialKeys.postLike(postId), {
          liked: data.data.liked,
          count: data.data.likesCount
        })
      }
    },
  })
}

// User Follows
const fetchUserFollow = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}/follow`)
  if (!response.ok) throw new Error('Failed to fetch follow status')
  
  const data = await response.json()
  return {
    following: data.following,
    followersCount: data.followersCount,
    followingCount: data.followingCount
  }
}

export const useUserFollow = (userId: string) => {
  return useQuery({
    queryKey: socialKeys.userFollow(userId),
    queryFn: () => fetchUserFollow(userId),
    enabled: !!userId && userId.length === 24,
  })
}

export const useFollowUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error('Failed to follow user')
      return response.json()
    },
    onSuccess: (data, userId) => {
      queryClient.setQueryData(socialKeys.userFollow(userId), {
        following: data.data.following,
        followersCount: data.data.followersCount,
        followingCount: data.data.followingCount
      })
    },
  })
}