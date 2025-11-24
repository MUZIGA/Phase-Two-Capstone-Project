// ...existing code...
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { SearchBar } from './components/search-bar' // fixed: removed trailing '-'
import { TagFilter } from './components/tag-filter'
import { FeedCard } from './components/feedCard'
import { Pagination } from './components/pagination'
import { FeedSkeleton } from './components/loading-skeleton'
import { usePostsHook } from './lib/../hooks/use-post'
import { usePagination } from './lib/../hooks/use-pagination'
import { useSearch } from './lib/search-context'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Post } from './lib/post-context'

export default function Home() {
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'recommended'>('latest')
  const [viewMode, setViewMode] = useState<'pagination' | 'infinite'>('pagination')
  const { posts = [], isLoading } = usePostsHook({ sortBy: sortBy === 'recommended' ? 'latest' : sortBy })
  const { searchQuery, selectedTag } = useSearch()

  const {
    currentItems = [],
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage
  } = usePagination({ items: posts, itemsPerPage: 6 })

  const sortedPosts = posts
  const displayPosts = viewMode === 'pagination' ? currentItems : posts
  const hasMore = false
  const isLoadingMore = false
  const isFetching = false

  const featuredPost = posts && posts.length > 0 ? posts[0] : null

  return (
    <main className="min-h-screen bg-gray-50">
      
      <section className="py-16 px-4 md:py-24 bg-indigo-600 border-b border-indigo-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to WriteHub
          </h1>
          <p className="text-lg mb-8">
            Discover stories, ideas, and insights from writers and developers around the world.
          </p>
          <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
            <Link href="/write">Start Writing</Link>
          </Button>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Search</h3>
                <SearchBar />
              </div>

              {/* View Mode Toggle */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">View Mode</h3>
                <div className="space-y-2">
                  <Button
                    variant={viewMode === 'pagination' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setViewMode('pagination')}
                  >
                    Pagination
                  </Button>
                  <Button
                    variant={viewMode === 'infinite' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setViewMode('infinite')}
                  >
                    Infinite Scroll
                  </Button>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Sort by</h3>
                <div className="space-y-2">
                  <Button
                    variant={sortBy === 'latest' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setSortBy('latest')
                      if (viewMode === 'pagination') goToPage(1)
                    }}
                  >
                    Latest
                  </Button>
                  <Button
                    variant={sortBy === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setSortBy('popular')
                      if (viewMode === 'pagination') goToPage(1)
                    }}
                  >
                    Most Popular
                  </Button>
                  <Button
                    variant={sortBy === 'recommended' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setSortBy('recommended')
                      if (viewMode === 'pagination') goToPage(1)
                    }}
                  >
                    Recommended
                  </Button>
                </div>
              </div>

            {/* Tag Filter */}
              <TagFilter />
            </div>
          </aside>

          {/* Main feed */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Post */}
            {!searchQuery && !selectedTag && featuredPost && !isLoading && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Featured</h2>
                <Card className="overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer border border-gray-200">
                  {featuredPost.image && (
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <Image
                        src={featuredPost.image || "/placeholder.svg"}
                        alt={featuredPost.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <Link href={`/posts/${featuredPost.slug}`}>
                      <h3 className="text-2xl font-bold mb-2 text-indigo-600 hover:text-indigo-800">
                        {featuredPost.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                  </div>
                </Card>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {searchQuery ? 'Search Results' : selectedTag ? `Tagged: ${selectedTag}` : 'Latest Stories'}
                </h2>
                <span className="text-sm text-gray-500">
                  {sortedPosts.length} post{sortedPosts.length !== 1 ? 's' : ''}
                </span>
              </div>

              {isLoading ? (
                <FeedSkeleton />
              ) : sortedPosts.length === 0 ? (
                <Card className="p-12 text-center bg-white border border-gray-200">
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'No posts found matching your search' : 'No posts yet'}
                  </p>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayPosts.map((post: any) => (
                      <FeedCard key={post.id} post={post} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {viewMode === 'pagination' && totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                      hasNextPage={hasNextPage}
                      hasPreviousPage={hasPreviousPage}
                    />
                  )}

                  {/* Infinite Scroll Loading */}
                  {viewMode === 'infinite' && (isLoadingMore || isFetching) && (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  )}

                  {/* Infinite Scroll End Message */}
                  {viewMode === 'infinite' && !hasMore && displayPosts.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You&apos;ve reached the end!</p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
