'use client'

import { useSearch } from '../lib/search-context'
import { usePosts } from '../lib/post-context'
import { Button } from '../components/ui/button'
import Link from 'next/link'

interface TagFilterProps {
  className?: string
}

export function TagFilter({ className = '' }: TagFilterProps) {
  const { selectedTag, setSelectedTag, getAllTags } = useSearch()
  const { posts } = usePosts()

  const tags = getAllTags(posts)

  if (tags.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Tags</h3>
        {selectedTag && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedTag(null)}
            className="text-xs hover:bg-transparent"
            aria-label="Clear tag filter"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Button
            key={tag}
            variant={selectedTag === tag ? 'default' : 'outline'}
            size="sm"
            className={`transition-colors ${
              selectedTag === tag ? 'bg-primary' : 'hover:bg-accent'
            }`}
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            asChild
          >
            <Link href={`/tags/${tag}`}>
              #{tag}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}