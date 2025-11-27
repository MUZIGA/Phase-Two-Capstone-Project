import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await connectToDatabase()

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get users who follow this user
    const followers = await User.find({ following: id }, 'name email avatar')
      .sort({ createdAt: -1 })
      .lean()

    const formattedFollowers = followers.map(follower => ({
      id: follower._id.toString(),
      name: follower.name,
      email: follower.email,
      avatar: follower.avatar,
    }))

    return NextResponse.json({
      success: true,
      data: formattedFollowers,
      count: formattedFollowers.length,
    })
  } catch (error) {
    console.error('[GET_FOLLOWERS_ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 })
  }
}
