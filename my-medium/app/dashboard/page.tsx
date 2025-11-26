'use client'

import { useAuth } from '../lib/auth-context'
import { usePosts } from '../lib/post-context'
import { useUserStats } from '../hooks/use-user-stats'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import Link from 'next/link'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { posts, drafts } = usePosts()
  const router = useRouter()
  const stats = useUserStats(user?.id ?? '')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  
  const userDrafts = drafts.filter(d => d.authorId === user.id)

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}!
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>

    
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-muted-foreground text-sm mb-1">Published Posts</div>
            <div className="text-3xl font-bold text-foreground">{stats.postCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-muted-foreground text-sm mb-1">Draft Posts</div>
            <div className="text-3xl font-bold text-foreground">{userDrafts.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-muted-foreground text-sm mb-1">Total Views</div>
            <div className="text-3xl font-bold text-foreground">{stats.totalViews}</div>
          </Card>
          <Card className="p-4">
            <div className="text-muted-foreground text-sm mb-1">Total Likes</div>
            <div className="text-3xl font-bold text-foreground">{stats.totalLikes}</div>
          </Card>
        </div>

    
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-muted-foreground text-sm mb-1">Followers</div>
            <div className="text-2xl font-bold text-foreground">{stats.followers}</div>
          </Card>
          <Card className="p-4">
            <div className="text-muted-foreground text-sm mb-1">Following</div>
            <div className="text-2xl font-bold text-foreground">{stats.following}</div>
          </Card>
        </div>

        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/write">Write New Post</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/draft">View Drafts ({userDrafts.length})</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/profile/${user.id}`}>View Profile</Link>
            </Button>
          </div>
        </div>

        
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Posts</h2>
          {posts.filter(p => p.authorId === user.id).length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No published posts yet.</p>
              <Button asChild className="mt-4">
                <Link href="/write">Create your first post</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts
                .filter(p => p.authorId === user.id)
                .slice(0, 5)
                .map(post => (
                  <Card key={post.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link href={`/posts/${post.slug}`}>
                          <h3 className="text-xl font-bold text-foreground hover:text-primary mb-2">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span>{post.views || 0} views</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <Link href={`/write?draft=${post.id}`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
