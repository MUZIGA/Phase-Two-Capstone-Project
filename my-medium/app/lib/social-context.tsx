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
  addComment: (postId: string, content: string, authorId: string, authorName: string) => Promise<void>
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

const API_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`,
}

async function handleApiResponse(response: Response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.error || 'Something went wrong. Please try again.'
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
    try {
      const response = await fetch(`/api/post/${postId}/comments`)
      const data = await handleApiResponse(response)
      setComments(prev => ({
        ...prev,
        [postId]: data.data || []
      }))
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const addComment = async (postId: string, content: string, authorId: string, authorName: string) => {
    try {
      const response = await fetch(`/api/comment`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ postId, content, authorId, authorName }),
      })
      const data = await handleApiResponse(response)
      await loadComments(postId) // Reload comments
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comment/${commentId}`, {
        method: 'DELETE',
        headers: API_HEADERS,
      })
      await handleApiResponse(response)
      // Reload comments for all posts (simplified)
      Object.keys(comments).forEach(postId => loadComments(postId))
    } catch (error) {
      console.error('Failed to delete comment:', error)
      throw error
    }
  }

  const getCommentsByPost = (postId: string) => {
    return comments[postId] || []
  }

  const likeComment = async (commentId: string, userId: string) => {
    try {
      const response = await fetch(`/api/comment/${commentId}/like`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ userId }),
      })
      await handleApiResponse(response)
      // Reload comments for all posts (simplified)
      Object.keys(comments).forEach(postId => loadComments(postId))
    } catch (error) {
      console.error('Failed to like comment:', error)
      throw error
    }
  }

  // ===== POST LIKES =====
  const loadPostLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/post/${postId}/clap`)
      const data = await handleApiResponse(response)
      setPostLikes(prev => ({
        ...prev,
        [postId]: { liked: data.liked, count: data.likesCount }
      }))
    } catch (error) {
      console.error('Failed to load post like:', error)
    }
  }

  const likePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/post/${postId}/clap`, {
        method: 'POST',
        headers: API_HEADERS,
      })
      const data = await handleApiResponse(response)
      setPostLikes(prev => ({
        ...prev,
        [postId]: { liked: data.data.liked, count: data.data.likesCount }
      }))
    } catch (error) {
      console.error('Failed to like post:', error)
      throw error
    }
  }

  // ===== FOLLOWS =====
  const loadFollow = async (userId: string) => {
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
      console.error('Failed to load follow status:', error)
    }
  }

  const followUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: API_HEADERS,
      })
      const data = await handleApiResponse(response)
      setFollows(prev => ({
        ...prev,
        [userId]: {
          following: data.data.following,
          followersCount: data.data.followersCount,
          followingCount: data.data.followingCount
        }
      }))
    } catch (error) {
      console.error('Failed to follow user:', error)
      throw error
    }
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
