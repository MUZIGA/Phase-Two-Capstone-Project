'use client'

import { useAuth } from '../lib/auth-context'
import { useSocial } from '../lib/social-context'
import { Button } from '../components/ui/button'
import { useEffect } from 'react'

interface LikeButtonProps {
  postId: string
}

export function LikeButton({ postId }: LikeButtonProps) {
  const { user } = useAuth()
  const { postLikes, likePost, loadPostLike } = useSocial()

  useEffect(() => {
    loadPostLike(postId)
  }, [postId, loadPostLike])

  const postLike = postLikes[postId] || { liked: false, count: 0 }

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like posts')
      return
    }
    try {
      await likePost(postId)
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  return (
    <Button
      variant={postLike.liked ? 'default' : 'outline'}
      onClick={handleLike}
      className="gap-2"
    >
      <span>👏</span>
      <span>{postLike.count > 0 ? postLike.count : 'Like'}</span>
    </Button>
  )
}
