import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'
import { authenticateRequest } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, bio } = await request.json()

    await connectToDatabase()

    const updatedUser = await User.findByIdAndUpdate(
      auth.userId,
      { name, bio },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt,
      }
    })
  } catch (error) {
    console.error('[UPDATE_PROFILE_ERROR]', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}