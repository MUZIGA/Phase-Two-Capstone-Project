'use client'

import { useState } from 'react'
import { useSearch } from '../lib/search-context'
import { Button } from './ui/button'

export function SearchBar() {
  const { searchQuery, setSearchQuery, clearSearch, isSearching } = useSearch()
  const [inputValue, setInputValue] = useState(searchQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(inputValue)
  }

  const handleClear = () => {
    setInputValue('')
    clearSearch()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search posts, authors, or tags..."
          className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {inputValue && (
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      )}
      
      <Button type="submit" disabled={isSearching}>
        Search
      </Button>
    </form>
  )
}