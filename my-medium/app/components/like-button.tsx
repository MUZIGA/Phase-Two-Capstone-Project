'use client'


import { useAuth } from '../lib/auth-context'
import { useSocial } from '../lib/social-context'
import { Button } from '@/components/ui/button'

interface LikeButtonProps {
  postId: string
}

export function LikeButton({ postId }: LikeButtonProps) {
  const { user } = useAuth()
  const { likePost, unlikePost, hasUserLikedPost, getLikeCount } = useSocial()

  const isLiked = user ? hasUserLikedPost(postId, user.id) : false
  const likeCount = getLikeCount(postId)

  const handleLike = () => {
    if (!user) {
      alert('Please sign in to like posts')
      return
    }

    if (isLiked) {
      unlikePost(postId, user.id)
    } else {
      likePost(postId, user.id)
    }
  }

  return (
    <Button
      variant={isLiked ? 'default' : 'outline'}
      onClick={handleLike}
      className="gap-2"
    >
      <span text-lg>👏</span>
      <span>{likeCount > 0 ? likeCount : 'Like'}</span>
    </Button>
  )
}
