'use client'


import { useAuth } from '../lib/auth-context'
import { useSocial } from '../lib/social-context'
import { Button } from '../components/ui/button'

interface FollowButtonProps {
  userId: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function FollowButton({ userId, variant = 'outline' }: FollowButtonProps) {
  const { user } = useAuth()
  const { followUser, unfollowUser, isFollowing } = useSocial()

  if (!user || user.id === userId) {
    return null
  }

  const isUserFollowing = isFollowing(user.id, userId)

  const handleFollow = () => {
    if (isUserFollowing) {
      unfollowUser(user.id, userId)
    } else {
      followUser(user.id, userId)
    }
  }

  return (
    <Button
      variant={isUserFollowing ? 'default' : variant}
      onClick={handleFollow}
      size="sm"
    >
      {isUserFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
