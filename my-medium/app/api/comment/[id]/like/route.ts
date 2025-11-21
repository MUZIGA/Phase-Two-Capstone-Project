import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Comment from '@/lib/models/comment'
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

    const comment = await Comment.findById(id)
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const userId = auth.userId
    const likes = comment.likes || []
    const hasLiked = likes.some((likeId: any) => likeId.toString() === userId)

    if (hasLiked) {
      // Unlike
      comment.likes = likes.filter((likeId: any) => likeId.toString() !== userId)
    } else {
      // Like
      comment.likes = [...likes, userId as any]
    }

    await comment.save()

    return NextResponse.json({
      success: true,
      data: {
        liked: !hasLiked,
        likesCount: comment.likes.length,
      },
    })
  } catch (error) {
    console.error('[LIKE_COMMENT_ERROR]', error)
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 })
  }
}
