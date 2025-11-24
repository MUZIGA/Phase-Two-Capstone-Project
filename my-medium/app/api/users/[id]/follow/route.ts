import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'
import { authenticateRequest } from '@/lib/auth'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const target = await User.findById(id)
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Try to authenticate to compute "following" relative to current user
    let following = false
    const auth = await authenticateRequest(request)
    if (auth && mongoose.Types.ObjectId.isValid(auth.userId)) {
      const current = await User.findById(auth.userId)
      if (current) {
        following = current.following.some((f: any) => f.toString() === id)
      }
    }

    return NextResponse.json({
      success: true,
      following,
      followersCount: target.followers.length,
      followingCount: target.following.length,
    })
  } catch (error) {
    console.error('[GET_FOLLOW_STATUS_ERROR]', error)
    return NextResponse.json({ error: 'Failed to get follow status' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const currentUserId = auth.userId

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    if (id === currentUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    await connectToDatabase()

    const [userToFollow, currentUser] = await Promise.all([
      User.findById(id),
      User.findById(currentUserId),
    ])

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

