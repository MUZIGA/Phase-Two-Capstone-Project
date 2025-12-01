'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Button } from "../../components/ui/button"
import Image from "next/image"
import { JsonLd } from "../../components/json-ld"
import { ClientInteractions } from "./client-interactions"
import Link from "next/link"
import type { Post } from '@/lib/types'

export default function PostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/post?slug=${encodeURIComponent(slug)}&published=true`, {
          credentials: 'include'
        })
        
        if (!response.ok) {
          setError(true)
          return
        }
        
        const data = await response.json()
        if (data.success && data.data?.length > 0) {
          setPost(data.data[0])
        } else {
          setError(true)
        }
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error || !post || !post.published) {
    notFound()
  }

  return (
    <>
      <JsonLd post={post} />
      <main className="min-h-screen bg-background">
        {post.image && (
          <div className="w-full h-80 relative">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        <article className="max-w-3xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="text-primary hover:text-primary/80 transition mb-6 inline-block"
          >
            ← Back to Home
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    {post.author[0]}
                  </span>
                </div>

                <div>
                  <p className="font-medium text-foreground">{post.author}</p>
                  <p className="text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {post.views !== undefined && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <p className="text-sm">{post.views} views</p>
                </>
              )}
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-invert max-w-none mb-12">
            <div
              className="text-foreground leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          <div className="border-t border-border pt-8 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-lg">
                  {post.author[0]}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-1">{post.author}</h3>

                <p className="text-muted-foreground text-sm mb-3">
                  Full-stack developer and technical writer passionate about
                  sharing knowledge.
                </p>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/profile/${post.authorId}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <ClientInteractions postId={post.id} authorId={post.authorId} />
        </article>
      </main>
    </>
  )
}