import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await connectToDatabase()

    const url = new URL(request.url)
    const pageParam = url.searchParams.get('page')
    const limitParam = url.searchParams.get('limit')

    let page = Math.max(parseInt(pageParam || '1', 10), 1)
    let limit = Math.min(Math.max(parseInt(limitParam || '20', 10), 1), 50)

    const user = await User.findById(id).lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const followingIds = Array.isArray(user.following) ? user.following : []

    if (followingIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        page,
        limit,
        total: 0,
        totalPages: 0,
        count: 0,
      })
    }

    const total = await User.countDocuments({ _id: { $in: followingIds } })

    const following = await User.find({ _id: { $in: followingIds } }, 'name avatar bio')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const data = following.map((followedUser: any) => ({
      id: followedUser._id.toString(),
      name: followedUser.name,
      avatar: followedUser.avatar,
      bio: followedUser.bio ?? '',
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data,
      page,
      limit,
      total,
      totalPages,
      count: data.length,
    })
  } catch (error) {
    console.error('[GET_FOLLOWING_ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 })
  }
}
