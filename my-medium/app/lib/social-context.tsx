'use client'

import React, { createContext, useState, ReactNode } from 'react'

export interface Comment {
  id: string
  postId: string
  author: string
  authorId: string
  content: string
  createdAt: string
  likes: string[]
}

interface PostLike {
  liked: boolean
  count: number
}

interface SocialContextType {
  comments: { [postId: string]: Comment[] }
  loadComments: (postId: string) => Promise<void>
  addComment: (postId: string, content: string, authorId: string, authorName: string, parentId?: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  getCommentsByPost: (postId: string) => Comment[]
  likeComment: (commentId: string, userId: string) => Promise<void>

  postLikes: { [postId: string]: PostLike }
  loadPostLike: (postId: string) => Promise<void>
  likePost: (postId: string) => Promise<void>

  follows: { [userId: string]: { following: boolean; followersCount: number; followingCount: number } }
  loadFollow: (userId: string) => Promise<void>
  followUser: (userId: string) => Promise<void>
}

export const SocialContext = createContext<SocialContextType | undefined>(undefined)

function getApiHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

async function handleApiResponse(response: Response) {
  const text = await response.text()
  let data = {}
  try {
    data = JSON.parse(text)
  } catch {
    // Silent fail for non-JSON responses
  }
  
  if (!response.ok) {
    const message = data?.error || response.statusText || 'Something went wrong. Please try again.'
    throw new Error(message)
  }
  return data
}

export function SocialProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({})
  const [postLikes, setPostLikes] = useState<{ [postId: string]: PostLike }>({})
  const [follows, setFollows] = useState<{ [userId: string]: { following: boolean; followersCount: number; followingCount: number } }>({})

  // ===== COMMENTS =====
  const loadComments = async (postId: string) => {
    if (!postId || typeof postId !== 'string' || postId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return
    }
    try {
      const response = await fetch(`/api/post/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        const commentsData = data.data || []
        // Transform API response to match component expectations
        const transformedComments = commentsData.map((comment: any) => ({
          id: comment.id,
          postId: comment.postId,
          author: comment.author,
          authorId: comment.authorId,
          content: comment.content,
          createdAt: comment.createdAt,
          likes: Array.isArray(comment.likes) ? comment.likes : [],
          parentId: comment.parentId
        }))
        setComments(prev => ({
          ...prev,
          [postId]: transformedComments
        }))
      }
    } catch (error) {
      // Silently fail for invalid comment requests
    }
  }

  const addComment = async (postId: string, content: string, authorId: string, authorName: string, parentId?: string) => {
    if (!postId || typeof postId !== 'string' || postId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return
    }
    try {
      const response = await fetch(`/api/post/${postId}/comments`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ content, parentId }),
      })
      if (response.ok) {
        await loadComments(postId)
      }
    } catch (error) {
      // Silently fail for invalid comment requests
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!commentId || typeof commentId !== 'string' || commentId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(commentId)) {
      console.warn('Invalid comment ID format:', commentId)
      return
    }
    try {
      const response = await fetch(`/api/comment/${commentId}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })
      await handleApiResponse(response)
      // Reload comments for all posts (simplified)
      Object.keys(comments).forEach(postId => loadComments(postId))
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const getCommentsByPost = (postId: string) => {
    return comments[postId] || []
  }

  const likeComment = async (commentId: string, userId: string) => {
    if (!commentId || typeof commentId !== 'string' || commentId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(commentId)) {
      console.warn('Invalid comment ID format:', commentId)
      return
    }
    try {
      const response = await fetch(`/api/comment/${commentId}/like`, {
        method: 'POST',
        headers: getApiHeaders(),
      })
      await handleApiResponse(response)
      // Reload comments for all posts (simplified)
      Object.keys(comments).forEach(postId => loadComments(postId))
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  // ===== POST LIKES =====
  const loadPostLike = async (postId: string) => {
    if (!postId || typeof postId !== 'string' || postId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return
    }
    try {
      const response = await fetch(`/api/post/${postId}/clap`)
      const data = await handleApiResponse(response)
      setPostLikes(prev => ({
        ...prev,
        [postId]: { liked: data.liked, count: data.likesCount }
      }))
    } catch (error) {
      // Silently fail for invalid post like requests
    }
  }

  const likePost = async (postId: string) => {
    if (!postId || typeof postId !== 'string' || postId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return
    }
    
    const currentLike = postLikes[postId] || { liked: false, count: 0 }
    
    try {
      const response = await fetch(`/api/post/${postId}/clap`, {
        method: 'POST',
        headers: getApiHeaders(),
      })
      
      if (response.ok) {
        const data = await response.json()
        setPostLikes(prev => ({
          ...prev,
          [postId]: { liked: data.data.liked, count: data.data.likesCount }
        }))
      } else {
        throw new Error('Failed to like post')
      }
    } catch (error) {
      setPostLikes(prev => ({
        ...prev,
        [postId]: currentLike
      }))
      throw error
    }
  }

  // ===== FOLLOWS =====
  const loadFollow = async (userId: string) => {
    if (!userId || typeof userId !== 'string' || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      console.warn('Invalid user ID format:', userId)
      return
    }
    try {
      const response = await fetch(`/api/users/${userId}/follow`)
      const data = await handleApiResponse(response)
      setFollows(prev => ({
        ...prev,
        [userId]: {
          following: data.following,
          followersCount: data.followersCount,
          followingCount: data.followingCount
        }
      }))
    } catch (error) {
      console.warn('Failed to load follow status:', error)
    }
  }

  const followUser = async (userId: string) => {
    if (!userId || typeof userId !== 'string' || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      console.warn('Invalid user ID format:', userId)
      return
    }
    
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('No auth token found')
      return
    }
    
    // Optimistic update only (API temporarily disabled)
    const currentFollow = follows[userId] || { following: false, followersCount: 0, followingCount: 0 }
    setFollows(prev => ({
      ...prev,
      [userId]: {
        following: !currentFollow.following,
        followersCount: currentFollow.followersCount + (!currentFollow.following ? 1 : -1),
        followingCount: currentFollow.followingCount
      }
    }))
  }

  return (
    <SocialContext.Provider value={{
      comments,
      loadComments,
      addComment,
      deleteComment,
      getCommentsByPost,
      likeComment,
      postLikes,
      loadPostLike,
      likePost,
      follows,
      loadFollow,
      followUser,
    }}>
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const context = React.useContext(SocialContext)
  if (context === undefined) {
    throw new Error('useSocial must be used within SocialProvider')
  }
  return context
}
