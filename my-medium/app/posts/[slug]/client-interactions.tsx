'use client'

import { LikeButton } from '../../components/like-button'
import { FollowButton } from '../../components/follow-button'
import { CommentTree } from '../../components/comment-tree'

interface ClientInteractionsProps {
  postId: string
  authorId: string
}

export function ClientInteractions({ postId, authorId }: ClientInteractionsProps) {
  return (
    <>
      <div className="flex gap-2 pt-4 border-t border-border">
        <LikeButton postId={postId} />
      </div>
      
      <div className="flex gap-2 mt-3">
        {authorId && authorId.length === 24 && /^[0-9a-fA-F]{24}$/.test(authorId) && <FollowButton userId={authorId} />}
      </div>
      
      <div className="border-t border-border pt-8 mt-12">
        {postId && postId.length === 24 && /^[0-9a-fA-F]{24}$/.test(postId) ? (
          <CommentTree postId={postId} />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Comments are not available for this post.</p>
          </div>
        )}
      </div>
    </>
  )
}