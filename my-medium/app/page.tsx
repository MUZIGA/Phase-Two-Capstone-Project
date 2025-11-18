'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { SearchBar } from './components/search-bar'
import { TagFilter } from './components/tag-filter'
import { FeedCard } from './components/feedCard'
import { Pagination } from './components/pagination'
import { FeedSkeleton } from './components/loading.skeleton'
import { usePostsHook } from './lib/../hooks/use-posts'
import { usePagination } from './lib/../hooks/use-pagination'
import { useSearch } from './lib/search-context'
import { Button } from '@/components/ui/button'
import { Card } from './components/ui/card'

export default function Home() {
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const { posts, isLoading } = usePostsHook({ sortBy })
  const { searchQuery, selectedTag } = useSearch()

  const {
    currentItems,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage
  } = usePagination({ items: posts, itemsPerPage: 6 })

  const featuredPost = posts[0]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
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
                      goToPage(1)
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
                      goToPage(1)
                    }}
                  >
                    Most Popular
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
                    <div className="aspect-video overflow-hidden bg-gray-100">
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

            {/* Posts Feed */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {searchQuery ? 'Search Results' : selectedTag ? `Tagged: ${selectedTag}` : 'Latest Stories'}
                </h2>
                <span className="text-sm text-gray-500">
                  {posts.length} post{posts.length !== 1 ? 's' : ''}
                </span>
              </div>

              {isLoading ? (
                <FeedSkeleton />
              ) : posts.length === 0 ? (
                <Card className="p-12 text-center bg-white border border-gray-200">
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'No posts found matching your search' : 'No posts yet'}
                  </p>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentItems.map(post => (
                      <FeedCard key={post.id} post={post} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                      hasNextPage={hasNextPage}
                      hasPreviousPage={hasPreviousPage}
                    />
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
