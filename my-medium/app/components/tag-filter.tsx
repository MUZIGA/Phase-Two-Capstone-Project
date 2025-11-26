'use client'

import { Button } from './ui/button'

interface TagFilterProps {
  tags: string[]
  selectedTag: string | null
  onTagSelect: (tag: string | null) => void
}

export function TagFilter({ tags, selectedTag, onTagSelect }: TagFilterProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Filter by tag:</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedTag === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTagSelect(null)}
        >
          All
        </Button>
        {tags.slice(0, 10).map(tag => (
          <Button
            key={tag}
            variant={selectedTag === tag ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTagSelect(tag)}
          >
            #{tag}
          </Button>
        ))}
        {tags.length > 10 && (
          <span className="text-sm text-muted-foreground self-center">
            +{tags.length - 10} more
          </span>
        )}
      </div>
    </div>
  )
}