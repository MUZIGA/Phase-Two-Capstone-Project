'use client'

import { useState, useEffect } from 'react'
import { usePosts } from '../lib/post-context'
import { useSearch } from '../lib/search-context'
import { FeedCard } from './feedCard'
import { SearchBar } from './search-bar'
import { TagFilter } from './tag-filter'
import { Button } from './ui/button'
import { Card } from './ui/card'

export function HomeFeed() {
  const { posts, isLoading } = usePosts()
  const { searchResults, isSearching, searchQuery } = useSearch()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [displayedPosts, setDisplayedPosts] = useState(6)
  const [feedType, setFeedType] = useState<'latest' | 'recommended'>('latest')

  // Get all unique tags from posts
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)))

  // Filter posts based on search, tag, and feed type
  const filteredPosts = (() => {
    let result = searchQuery ? searchResults : posts

    if (selectedTag) {
      result = result.filter(post => post.tags.includes(selectedTag))
    }

    if (feedType === 'recommended') {
      // Simple recommendation: sort by likes and views
      result = [...result].sort((a, b) => 
        ((b.likes || 0) + (b.views || 0)) - ((a.likes || 0) + (a.views || 0))
      )
    } else {
      // Latest: sort by creation date
      result = [...result].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }

    return result
  })()

  const visiblePosts = filteredPosts.slice(0, displayedPosts)
  const hasMore = displayedPosts < filteredPosts.length

  const loadMore = () => {
    setDisplayedPosts(prev => prev + 6)
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

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar />

      {/* Feed Type Toggle */}
      <div className="flex gap-2">
        <Button
          variant={feedType === 'latest' ? 'default' : 'outline'}
          onClick={() => setFeedType('latest')}
          size="sm"
        >
          Latest
        </Button>
        <Button
          variant={feedType === 'recommended' ? 'default' : 'outline'}
          onClick={() => setFeedType('recommended')}
          size="sm"
        >
          Recommended
        </Button>
      </div>

      {/* Tag Filter */}
      <TagFilter
        tags={allTags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
      />

      {/* Results Info */}
      {(searchQuery || selectedTag) && (
        <div className="text-sm text-muted-foreground">
          {isSearching ? 'Searching...' : `${filteredPosts.length} posts found`}
          {selectedTag && ` for tag "${selectedTag}"`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* Posts Grid */}
      {visiblePosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePosts.map(post => (
              <FeedCard key={post.id} post={post} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <Button onClick={loadMore} variant="outline">
                Load More Posts
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No posts found
          </h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedTag 
              ? 'Try adjusting your search or filter criteria.'
              : 'Be the first to publish a post!'
            }
          </p>
        </Card>
      )}
    </div>
  )
}