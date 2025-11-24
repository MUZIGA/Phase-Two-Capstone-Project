'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FeedCard } from '../../components/feedCard'
import { Pagination } from '../../components/pagination'
import { FeedSkeleton } from '../../components/loading-skeleton'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { usePagination } from '../../hooks/use-pagination'

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  authorId: string
  tags: string[]
  published: boolean
  slug: string
  image?: string
  views: number
  likes: number
  createdAt: string
  updatedAt: string
}

export default function TagPage() {
  const params = useParams()
  const tag = params.tag as string
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/post?tag=${encodeURIComponent(tag)}&published=true`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setPosts(data.data)
          } else {
            setError('Failed to load posts')
          }
        } else {
          setError('Failed to load posts')
        }
      } catch (err) {
        setError('Failed to load posts')
      } finally {
        setIsLoading(false)
      }
    }

    if (tag) {
      fetchPosts()
    }
  }, [tag])

  const {
    currentItems,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage
  } = usePagination({ items: posts, itemsPerPage: 12 })

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8">
            <Link href="/" className="text-primary hover:text-primary/80 transition mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-2">#{tag}</h1>
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
          <FeedSkeleton />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8">
            <Link href="/" className="text-primary hover:text-primary/80 transition mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-2">#{tag}</h1>
          </div>
          <Card className="p-12 text-center text-muted-foreground">
            <p>{error}</p>
            <Button asChild className="mt-4">
              <Link href="/">Go Home</Link>
            </Button>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:text-primary/80 transition mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">#{tag}</h1>
          <p className="text-muted-foreground mb-4">
            {posts.length} post{posts.length !== 1 ? 's' : ''} tagged with "{tag}"
          </p>
        </div>

        {posts.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <p>No posts found with this tag.</p>
            <Button asChild className="mt-4">
              <Link href="/explore">Explore Other Tags</Link>
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
      </div>
    </main>
  )
}
