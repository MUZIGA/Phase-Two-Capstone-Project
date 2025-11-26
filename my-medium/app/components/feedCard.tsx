'use client'

import { Post } from '../lib/post-context'
import Link from 'next/link'
import { Card } from './ui/card'
import { OptimizedImage } from './optimized-image'

interface FeedCardProps {
  post: Post
}

export function FeedCard({ post }: FeedCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {post.image && (
        <div className="aspect-video relative bg-muted">
          <OptimizedImage
            src={post.image}
            alt={post.title}
            fill
            className="hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-6">
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map(tag => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded hover:bg-muted/80 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}


        <Link href={`/posts/${post.slug}`}>
          <h3 className="text-xl font-bold text-foreground hover:text-primary mb-2 line-clamp-2">
            {post.title}
          </h3>
        </Link>

        
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">
                {post.author[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">{post.author}</p>
              <p className="text-xs">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className="text-xs">{post.views || 0} views</span>
        </div>
      </div>
    </Card>
  )
}
