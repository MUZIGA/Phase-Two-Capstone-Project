'use client'

import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { useSocial } from '../lib/social-context'
import { Button } from '@/components/ui/button'
import { Card } from '../components/ui/card'

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth()
  const { comments, addComment, deleteComment, getCommentsByPost, likeComment } = useSocial()
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const postComments = getCommentsByPost(postId)

  // Submit comment
  const handleSubmitComment = async () => {
    if (!user) {
      alert('Please sign in to comment')
      return
    }

    if (!commentText.trim()) {
      alert('Comment cannot be empty')
      return
    }

    setIsSubmitting(true)
    try {
      addComment(postId, commentText, user.id, user.name)
      setCommentText('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Comments ({postComments.length})</h3>

        {user ? (
          <Card className="p-4 mb-6">
            <div className="space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCommentText('')}
                  disabled={!commentText.trim()}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !commentText.trim()}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 mb-6 text-center">
            <p className="text-muted-foreground mb-3">Sign in to leave a comment</p>
            <Button asChild variant="outline">
              <a href="/login">Sign In</a>
            </Button>
          </Card>
        )}
      </div>

      {/* Comments list */}
      {postComments.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <p>No comments yet. Be the first to comment!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {postComments.map(comment => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">{comment.author[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{comment.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {user?.id === comment.authorId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteComment(comment.id)}
                        className="text-destructive text-xs"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-foreground mb-3 leading-relaxed">{comment.content}</p>

              {/* Comment likes */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (user) {
                      likeComment(comment.id, user.id)
                    }
                  }}
                  className="text-xs"
                >
                  👍 {comment.likes.length > 0 ? comment.likes.length : ''}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
