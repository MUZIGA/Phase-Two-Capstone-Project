'use client'

import { Card } from '../components/ui/card'
import { SearchBar } from '../components/search-bar-'
import { TagFilter } from '../components/tag-filter'
import { FeedCard } from '../components/feedCard'
import { useSearch } from '../lib/search-context'
import { usePosts } from '../lib/post-context'
import { useState } from 'react'

export default function ExplorePage() {
  const { posts } = usePosts()
  const { filterPosts } = useSearch()
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')

  const filteredPosts = filterPosts(posts)
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.views || 0) - (a.views || 0)
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Explore</h1>
        <p className="text-muted-foreground mb-8">Discover amazing stories and insights</p>

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

              <TagFilter />
            </div>
          </aside>

          
          <div className="lg:col-span-3">
            {sortedPosts.length === 0 ? (
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
