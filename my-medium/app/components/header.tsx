'use client'

import Link from 'next/link'

import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { Button } from '@/components/ui/button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline text-foreground">WriteHub</span>
          </Link>

          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-foreground hover:text-primary transition">
              Home
            </Link>
            <Link href="/explore" className="text-foreground hover:text-primary transition">
              Explore
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition">
              About
            </Link>
          </nav>

          
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-xs md:text-sm">
                  <Link href="/write">✏️ Write</Link>
                </Button>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-xs md:text-sm">
                  <Link href="/drafts">Drafts</Link>
                </Button>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-xs md:text-sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
