import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Post from '@/lib/models/post'
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

