// app/hooks/use-user-stats.ts
import { useState, useEffect, useMemo } from 'react'
import { usePosts, Post } from '../lib/post-context'

export interface UserStats {
  totalPosts: number
  totalViews: number
  totalLikes: number
  followers: number
  following: number
}

/**
 * Custom hook to calculate user stats:
 * - total posts
 * - total views
 * - total likes
 * - followers count
 * - following count
 */
export function useUserStats(userId: string): UserStats {
  const { posts } = usePosts()
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)

  // Fetch followers/following counts from API
  useEffect(() => {
    if (!userId) return

    async function fetchStats() {
      try {
        // Followers count
        const followersRes = await fetch(`/api/users/${userId}/followers`)
        if (followersRes.ok) {
          const data = await followersRes.json()
          setFollowers(data.count || 0)
        }

        // Following count
        const followingRes = await fetch(`/api/users/${userId}/following`)
        if (followingRes.ok) {
          const data = await followingRes.json()
          setFollowing(data.count || 0)
        }
      } catch (err) {
        console.error('Failed to fetch followers/following:', err)
        setFollowers(0)
        setFollowing(0)
      }
    }

    fetchStats()
  }, [userId])

  // Calculate post stats
  const stats = useMemo(() => {
    const userPosts = posts.filter((post: Post) => post.authorId === userId)

    const totalViews = userPosts.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes || 0), 0)

    return {
      totalPosts: userPosts.length,
      totalViews,
      totalLikes,
      followers,
      following
    }
  }, [posts, userId, followers, following])

  return stats
}
