'use client'

import { Card } from '../components/ui/card'
import { SearchBar } from '../components/search-bar'
// import { TagFilter } from '../components/tag-filter'
import { FeedCard } from '../components/feedCard'
import { PersonalizedFeed } from '../components/personalized-feed'
// import { useSearch } from '../lib/search-context'
import { usePosts } from '../hooks/use-posts'
import { useAuth } from '../lib/auth-context'
import { Button } from '../components/ui/button'
import { useState, useEffect } from 'react'
export default function ExplorePage() {
  const { data: posts = [], isLoading, error, refetch } = usePosts({ published: true })
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const [feedType, setFeedType] = useState<'explore' | 'following'>('explore')

  // Refresh posts when page loads
  useEffect(() => {
    refetch()
  }, [refetch])

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.views || 0) - (a.views || 0)
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">Explore</h1>
            <p className="text-muted-foreground">Discover amazing stories and insights</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              size="sm"
            >
              Refresh
            </Button>
            {user && (
              <>
                <Button
                  variant={feedType === 'explore' ? 'default' : 'outline'}
                  onClick={() => setFeedType('explore')}
                >
                  Explore
                </Button>
                <Button
                  variant={feedType === 'following' ? 'default' : 'outline'}
                  onClick={() => setFeedType('following')}
                >
                  Following
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Search</h3>
                <SearchBar />
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Sort by</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`w-full px-3 py-2 rounded text-sm font-medium transition ${
                      sortBy === 'latest'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`w-full px-3 py-2 rounded text-sm font-medium transition ${
                      sortBy === 'popular'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    Popular
                  </button>
                </div>
              </div>


            </div>
          </aside>

          
          <div className="lg:col-span-3">
            {feedType === 'following' ? (
              <PersonalizedFeed />
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-40 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="p-12 text-center text-destructive">
                <p>Failed to load posts. Please try again.</p>
              </Card>
            ) : sortedPosts.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">
                <p>No posts found. Try adjusting your filters.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedPosts.map(post => (
                  <FeedCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
