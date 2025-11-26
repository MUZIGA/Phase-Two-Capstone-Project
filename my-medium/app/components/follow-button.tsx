'use client'

import { useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { useSocial } from '../lib/social-context'
import { Button } from '../components/ui/button'

interface FollowButtonProps {
  userId: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function FollowButton({ userId, variant = 'outline' }: FollowButtonProps) {
  const { user } = useAuth()
  const { followUser, follows, loadFollow } = useSocial()

  useEffect(() => {
    if (user && userId) {
      loadFollow(userId)
    }
  }, [userId, user, loadFollow])

  if (!user || user.id === userId) {
    return null
  }

  const followData = follows[userId]
  const isUserFollowing = followData?.following || false

  const handleFollow = async () => {
    await followUser(userId)
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
