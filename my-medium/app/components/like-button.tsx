'use client'

import { useAuth } from '../lib/auth-context'
import { usePostLike, useLikePost } from '../hooks/use-social'
import { Button } from './ui/button'

interface LikeButtonProps {
  postId: string
}

export function LikeButton({ postId }: LikeButtonProps) {
  const { user } = useAuth()
  const { data: likeData, isLoading } = usePostLike(postId)
  const likeMutation = useLikePost()

  const displayLike = likeData || { liked: false, count: 0 }

  const handleLike = () => {
    if (!user) {
      alert('Please sign in to like posts')
      return
    }
    likeMutation.mutate(postId)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      className={`transition-all duration-200 ${
        displayLike.liked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
      } ${likeMutation.isPending ? 'scale-110' : 'scale-100'}`}
      disabled={!user || likeMutation.isPending || isLoading}
    >
      <span className={`mr-1 ${likeMutation.isPending ? 'animate-bounce' : ''}`}>
        {displayLike.liked ? '❤️' : '🤍'}
      </span>
      {displayLike.count > 0 && displayLike.count}
    </Button>
  )
}