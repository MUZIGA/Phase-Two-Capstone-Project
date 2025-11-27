import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Comment from '@/lib/models/comment'
import Post from '@/lib/models/post'
import User from '@/lib/models/user'
import { authenticateRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectToDatabase()

    // Fetch all comments for the post; return flat list with parentId
    const comments = await Comment.find({ postId: id })
      .sort({ createdAt: 1 })
      .populate('author', 'name email avatar')
      .lean()

    const data = comments.map((c: any) => ({
      id: c._id.toString(),
      postId: c.postId.toString(),
      author: c.author?.name,
      authorId: c.author?._id?.toString(),
      authorAvatar: c.author?.avatar,
      content: c.content,
      likes: c.likes || [],
      parentId: c.parent ? c.parent.toString() : null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[LIST_COMMENTS_ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
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
    const { content, parentId } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    await connectToDatabase()

    // Verify post exists
    const post = await Post.findById(id)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // If replying, verify parent exists and belongs to same post
    let parent = null
    if (parentId) {
      parent = await Comment.findById(parentId)
      if (!parent || parent.postId.toString() !== id) {
        return NextResponse.json({ error: 'Invalid parent comment' }, { status: 400 })
      }
    }

    const comment = await Comment.create({
      postId: id,
      author: auth.userId,
      content: content.trim(),
      parent: parent ? parent._id : null,
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
          authorAvatar: (populatedComment!.author as any).avatar,
          content: populatedComment!.content,
          parentId: populatedComment!.parent ? (populatedComment!.parent as any).toString() : null,
          likes: populatedComment!.likes || [],
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

