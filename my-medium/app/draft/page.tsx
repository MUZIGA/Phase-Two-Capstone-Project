'use client'

import { useAuth } from '../lib/auth-context'
import { usePosts } from '../lib/post-context'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DraftsPage() {
  const { user } = useAuth()
  const { drafts, deleteDraft } = usePosts()
  const router = useRouter()

  
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) return null

  const userDrafts = drafts.filter(draft => draft.authorId === user.id)

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Drafts</h1>
            <p className="text-muted-foreground">
              {userDrafts.length} draft{userDrafts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild>
            <Link href="/write">New Post</Link>
          </Button>
        </div>

        
        {userDrafts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No drafts yet</p>
            <Button asChild>
              <Link href="/write">Start writing</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {userDrafts.map(draft => (
              <Card key={draft.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {draft.title || 'Untitled'}
                    </h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {draft.excerpt || 'No content yet'}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Last updated {new Date(draft.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <Link href={`/write?draft=${draft.id}`}>
                        Edit
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Delete this draft?')) {
                          deleteDraft(draft.id)
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
