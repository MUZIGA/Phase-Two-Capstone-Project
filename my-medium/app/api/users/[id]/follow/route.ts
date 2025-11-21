import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'
import { authenticateRequest } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const currentUserId = auth.userId

    if (id === currentUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    await connectToDatabase()

    const userToFollow = await User.findById(id)
    const currentUser = await User.findById(currentUserId)

    if (!userToFollow || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isFollowing = currentUser.following.some(
      (followId: any) => followId.toString() === id
    )

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (followId: any) => followId.toString() !== id
      )
      userToFollow.followers = userToFollow.followers.filter(
        (followerId: any) => followerId.toString() !== currentUserId
      )
    } else {
      // Follow
      currentUser.following.push(id as any)
      userToFollow.followers.push(currentUserId as any)
    }

    await Promise.all([currentUser.save(), userToFollow.save()])

    return NextResponse.json({
      success: true,
      data: {
        following: !isFollowing,
        followersCount: userToFollow.followers.length,
        followingCount: currentUser.following.length,
      },
    })
  } catch (error) {
    console.error('[FOLLOW_USER_ERROR]', error)
    return NextResponse.json({ error: 'Failed to update follow status' }, { status: 500 })
  }
}

