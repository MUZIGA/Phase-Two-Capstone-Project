import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Post from '@/lib/models/post'
import { authenticateRequest } from '@/lib/auth'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    await connectToDatabase()

    const post = await Post.findById(id)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const userId = auth?.userId
    const likes = post.likes || []
    const hasLiked = userId ? likes.some((likeId: any) => likeId.toString() === userId) : false

    return NextResponse.json({
      liked: hasLiked,
      likesCount: likes.length,
    })
  } catch (error) {
    console.error('[GET_CLAP_ERROR]', error)
    return NextResponse.json({ error: 'Failed to get like status' }, { status: 500 })
  }
}

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    await connectToDatabase()

    const post = await Post.findById(id)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const userId = auth.userId
    const likes = post.likes || []
    const hasLiked = likes.some((likeId: any) => likeId.toString() === userId)

    if (hasLiked) {
      // Unlike
      post.likes = likes.filter((likeId: any) => likeId.toString() !== userId)
    } else {
      // Like
      post.likes = [...likes, userId as any]
    }

    await post.save()

    return NextResponse.json({
      success: true,
      data: {
        liked: !hasLiked,
        likesCount: post.likes.length,
      },
    })
  } catch (error) {
    console.error('[CLAP_POST_ERROR]', error)
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 })
  }
}

