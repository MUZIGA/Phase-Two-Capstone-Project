'use client'

import { usePosts } from '../lib/post-context'
import { useSocial } from '../lib/social-context'
import { useMemo } from 'react'

export function useUserStats(userId: string) {
  const { posts } = usePosts()
  const { getLikeCount, getFollowerCount, getFollowingCount } = useSocial()

  return useMemo(() => {
    const userPosts = posts.filter(p => p.authorId === userId)
    
    const stats = {
      postCount: userPosts.length,
      totalViews: userPosts.reduce((sum, p) => sum + (p.views || 0), 0),
      totalLikes: userPosts.reduce((sum, p) => sum + getLikeCount(p.id), 0),
      followers: getFollowerCount(userId),
      following: getFollowingCount(userId)
    }

    return stats
  }, [userId, posts, getLikeCount, getFollowerCount, getFollowingCount])
}
