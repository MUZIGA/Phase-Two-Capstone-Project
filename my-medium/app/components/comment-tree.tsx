'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { useSocial } from '../lib/social-context'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface Comment {
  id: string
  postId: string
  author: string
  authorId: string
  content: string
  createdAt: string
  likes: string[]
  parentId?: string
  replies?: Comment[]
}

interface CommentTreeProps {
  postId: string
}

interface CommentItemProps {
  comment: Comment
  postId: string
  level: number
}

function CommentItem({ comment, postId, level }: CommentItemProps) {
  const { user } = useAuth()
  const { deleteComment, likeComment, addComment } = useSocial()
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLiked = user ? comment.likes.includes(user.id) : false
  const canDelete = user?.id === comment.authorId

  const handleReply = async () => {
    if (!user || !replyText.trim()) return
    
    setIsSubmitting(true)
    try {
      await addComment(postId, replyText, user.id, user.name, comment.id)
      setReplyText('')
      setIsReplying(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = () => {
    if (user) {
      likeComment(comment.id, user.id)
    }
  }

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <Card className="p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xs">
              {comment.author[0]}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-foreground">{comment.author}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <p className="text-foreground mb-3">{comment.content}</p>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLike}
                className={`text-xs ${isLiked ? 'text-red-500' : ''}`}
              >
                👍 {comment.likes.length}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs"
              >
                Reply
              </Button>
              
              {canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteComment(comment.id)}
                  className="text-xs text-destructive"
                >
                  Delete
                </Button>
              )}
            </div>
            
            {isReplying && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={isSubmitting || !replyText.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Reply'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsReplying(false)
                      setReplyText('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {comment.replies && comment.replies.map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          level={level + 1}
        />
      ))}
    </div>
  )
}

export function CommentTree({ postId }: CommentTreeProps) {
  const { user } = useAuth()
  const { comments, addComment, getCommentsByPost, loadComments } = useSocial()
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load comments when component mounts
  useEffect(() => {
    loadComments(postId)
  }, [postId, loadComments])

  const postComments = getCommentsByPost(postId)
  
  // Build comment tree
  const buildCommentTree = (comments: any[]): Comment[] => {
    const commentMap = new Map()
    const rootComments: Comment[] = []
    
    // First pass: create comment objects
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })
    
    // Second pass: build tree structure
    comments.forEach(comment => {
      const commentObj = commentMap.get(comment.id)
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(commentObj)
        }
      } else {
        rootComments.push(commentObj)
      }
    })
    
    return rootComments
  }

  const commentTree = buildCommentTree(postComments)

  const handleSubmitComment = async () => {
    if (!user || !commentText.trim()) return
    
    setIsSubmitting(true)
    try {
      await addComment(postId, commentText, user.id, user.name)
      setCommentText('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-foreground">
        Comments ({postComments.length})
      </h3>

      {user ? (
        <Card className="p-4">
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
        <Card className="p-4 text-center">
          <p className="text-muted-foreground mb-3">Sign in to leave a comment</p>
          <Button asChild variant="outline">
            <a href="/login">Sign In</a>
          </Button>
        </Card>
      )}

      {commentTree.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <p>No comments yet. Be the first to comment!</p>
        </Card>
      ) : (
        <div>
          {commentTree.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}