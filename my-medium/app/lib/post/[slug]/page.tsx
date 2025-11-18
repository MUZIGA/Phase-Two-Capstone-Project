'use client'

import { Button } from '@/components/ui/button'
import { usePosts } from '../../lib/post-context'
import { useAuth } from '../../lib/auth-context'
import { CommentSection } from "../../components/comment.section"
import { LikeButton } from '../../components/like.button'
import { FollowButton } from "../../components/follow.button"


import Link from 'next/link'
import { useEffect, useState } from 'react'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function PostPage({ params }: PostPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null)
  const { getPostBySlug } = usePosts()
  const { user } = useAuth()

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  if (!resolvedParams) return <div>Loading...</div>

  const post = getPostBySlug(resolvedParams.slug)
  const isAuthor = user?.id === post?.authorId

  if (!post) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Post not found</h1>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
    
      {post.image && (
        <div className="w-full h-80 overflow-hidden">
          <img 
            src={post.image || "/placeholder.svg"} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-primary hover:text-primary/80 transition mb-6 inline-block">
          ← Back to Home
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground text-balance">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{post.author[0]}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{post.author}</p>
                <p className="text-sm">{new Date(post.createdAt).toLocaleDateString()}</p>
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
              {post.tags.map(tag => (
                <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          
          <div className="flex gap-2 pt-4 border-t border-border">
            <LikeButton postId={post.id} />
          </div>
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
              <span className="text-primary-foreground font-bold text-lg">{post.author[0]}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">{post.author}</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Full-stack developer and technical writer passionate about sharing knowledge.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/profile/${post.authorId}`}>View Profile</Link>
                </Button>
                <FollowButton userId={post.authorId} />
                {isAuthor && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/write?draft=${post.id}`}>Edit Post</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {
        <div className="border-t border-border pt-8">
          <CommentSection postId={post.id} />
        </div>
      </article>
    </main>
  )
}
