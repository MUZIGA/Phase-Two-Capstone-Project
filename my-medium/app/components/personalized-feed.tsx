'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { Post } from '../lib/post-context'
import { FeedCard } from './feedCard'
import { Button } from './ui/button'
import { Card } from './ui/card'

export function PersonalizedFeed() {
  const { user } = useAuth()
  const [followingPosts, setFollowingPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayedPosts, setDisplayedPosts] = useState(6)

  useEffect(() => {
    const fetchFollowingPosts = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/post?followedBy=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setFollowingPosts(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch following posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowingPosts()
  }, [user])

  const visiblePosts = followingPosts.slice(0, displayedPosts)
  const hasMore = displayedPosts < followingPosts.length

  const loadMore = () => {
    setDisplayedPosts(prev => prev + 6)
  }

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Sign in for personalized content
        </h3>
        <p className="text-muted-foreground mb-4">
          Follow authors to see their latest posts in your personalized feed.
        </p>
        <Button asChild>
          <a href="/login">Sign In</a>
        </Button>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    )
  }

  if (followingPosts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No posts from followed authors
        </h3>
        <p className="text-muted-foreground mb-4">
          Start following authors to see their posts here. Discover new authors in the explore section.
        </p>
        <Button asChild variant="outline">
          <a href="/explore">Explore Authors</a>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Following ({followingPosts.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePosts.map(post => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button onClick={loadMore} variant="outline">
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  )
}