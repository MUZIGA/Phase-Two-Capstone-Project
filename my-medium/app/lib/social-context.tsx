'use client'

import React, { createContext, useState, ReactNode } from 'react'


export interface Comment {
  id: string
  postId: string
  author: string
  authorId: string
  content: string
  createdAt: Date
  likes: string[] 
}


interface SocialContextType {
  
  comments: Comment[]
  addComment: (postId: string, content: string, authorId: string, author: string) => void
  deleteComment: (id: string) => void
  getCommentsByPost: (postId: string) => Comment[]
  likeComment: (commentId: string, userId: string) => void

  
  postLikes: { [key: string]: string[] } // postId -> array of user IDs
  likePost: (postId: string, userId: string) => void
  unlikePost: (postId: string, userId: string) => void
  hasUserLikedPost: (postId: string, userId: string) => boolean
  getLikeCount: (postId: string) => number

  follows: { [key: string]: string[] } // userId -> array of following user IDs
  followUser: (followerId: string, followeeId: string) => void
  unfollowUser: (followerId: string, followeeId: string) => void
  isFollowing: (followerId: string, followeeId: string) => boolean
  getFollowerCount: (userId: string) => number
  getFollowingCount: (userId: string) => number
}

export const SocialContext = createContext<SocialContextType | undefined>(undefined)

export function SocialProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [postLikes, setPostLikes] = useState<{ [key: string]: string[] }>({})
  const [follows, setFollows] = useState<{ [key: string]: string[] }>({})

  // ===== COMMENTS =====
  const addComment = (postId: string, content: string, authorId: string, author: string) => {
    const newComment: Comment = {
      id: Math.random().toString(),
      postId,
      author,
      authorId,
      content,
      createdAt: new Date(),
      likes: []
    }
    setComments([newComment, ...comments])
  }

  const deleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id))
  }

  const getCommentsByPost = (postId: string): Comment[] => {
    return comments.filter(c => c.postId === postId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const likeComment = (commentId: string, userId: string) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        const hasLiked = c.likes.includes(userId)
        return {
          ...c,
          likes: hasLiked ? c.likes.filter(id => id !== userId) : [...c.likes, userId]
        }
      }
      return c
    }))
  }

  
  const likePost = (postId: string, userId: string) => {
    setPostLikes(prev => {
      const currentLikes = prev[postId] || []
      if (!currentLikes.includes(userId)) {
        return { ...prev, [postId]: [...currentLikes, userId] }
      }
      return prev
    })
  }

  const unlikePost = (postId: string, userId: string) => {
    setPostLikes(prev => {
      const currentLikes = prev[postId] || []
      return { ...prev, [postId]: currentLikes.filter(id => id !== userId) }
    })
  }

  const hasUserLikedPost = (postId: string, userId: string): boolean => {
    return (postLikes[postId] || []).includes(userId)
  }

  const getLikeCount = (postId: string): number => {
    return (postLikes[postId] || []).length
  }

  
  const followUser = (followerId: string, followeeId: string) => {
    if (followerId === followeeId) return 

    setFollows(prev => {
      const currentFollowing = prev[followerId] || []
      if (!currentFollowing.includes(followeeId)) {
        return { ...prev, [followerId]: [...currentFollowing, followeeId] }
      }
      return prev
    })
  }

  const unfollowUser = (followerId: string, followeeId: string) => {
    setFollows(prev => {
      const currentFollowing = prev[followerId] || []
      return { ...prev, [followerId]: currentFollowing.filter(id => id !== followeeId) }
    })
  }

  const isFollowing = (followerId: string, followeeId: string): boolean => {
    return (follows[followerId] || []).includes(followeeId)
  }

  const getFollowerCount = (userId: string): number => {
    
    let count = 0
    Object.values(follows).forEach(following => {
      if (following.includes(userId)) count++
    })
    return count
  }

  const getFollowingCount = (userId: string): number => {
    return (follows[userId] || []).length
  }

  return (
    <SocialContext.Provider value={{
      comments,
      addComment,
      deleteComment,
      getCommentsByPost,
      likeComment,
      postLikes,
      likePost,
      unlikePost,
      hasUserLikedPost,
      getLikeCount,
      follows,
      followUser,
      unfollowUser,
      isFollowing,
      getFollowerCount,
      getFollowingCount
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
