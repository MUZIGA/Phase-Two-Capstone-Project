'use client'

import { useState, useEffect } from 'react'
import { useSearch } from '../lib/search-context'
import { useDebounce } from '../hooks/use-debounce'
import { Button } from '../components/ui/button'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useSearch()
  const [input, setInput] = useState(searchQuery)

  // Debounce the input value
  const debouncedInput = useDebounce(input, 300)

  useEffect(() => {
    setSearchQuery(debouncedInput)
  }, [debouncedInput, setSearchQuery])

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search posts, authors..."
        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {input && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setInput('')}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          ✕
        </Button>
      )}
    </div>
  )
}
