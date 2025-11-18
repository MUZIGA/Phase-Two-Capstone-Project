'use client'

import { useSearch } from '@/lib/search-context'
import { usePosts } from '@/lib/post-context'
import { Button } from '@/components/ui/button'

export function TagFilter() {
  const { selectedTag, setSelectedTag, getAllTags } = useSearch()
  const { posts } = usePosts()

  const tags = getAllTags(posts)

  if (tags.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Tags</h3>
        {selectedTag && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedTag(null)}
            className="text-xs"
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
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className="text-xs"
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  )
}
