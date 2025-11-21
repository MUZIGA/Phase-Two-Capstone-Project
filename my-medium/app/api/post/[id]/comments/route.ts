import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Comment from '@/lib/models/comment'
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
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    await connectToDatabase()

    // Verify post exists
    const post = await Post.findById(id)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const comment = await Comment.create({
      postId: id,
      author: auth.userId,
      content: content.trim(),
      likes: [],
    })

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email avatar')
      .lean()

    return NextResponse.json(
      {
        success: true,
        data: {
          id: populatedComment!._id.toString(),
          postId: populatedComment!.postId.toString(),
          author: (populatedComment!.author as any).name,
          authorId: (populatedComment!.author as any)._id.toString(),
          content: populatedComment!.content,
          likes: populatedComment!.likes?.length || 0,
          createdAt: populatedComment!.createdAt,
          updatedAt: populatedComment!.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[CREATE_COMMENT_ERROR]', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

