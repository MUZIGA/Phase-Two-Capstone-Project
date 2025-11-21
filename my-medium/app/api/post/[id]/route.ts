import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Post from '@/lib/models/post'
import { authenticateRequest } from '@/lib/auth'
import mongoose from 'mongoose'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await connectToDatabase()

    // Check if id is a valid MongoDB ObjectId or a slug
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24
    const query = isObjectId ? { _id: id, published: true } : { slug: id, published: true }

    const post = await Post.findOne(query)
      .populate('author', 'name email avatar bio')
      .lean()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment views
    await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } })

    return NextResponse.json({
      success: true,
      data: {
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        author: (post.author as any).name,
        authorId: (post.author as any)._id.toString(),
        tags: post.tags,
        published: post.published,
        slug: post.slug,
        image: post.image,
        views: post.views + 1,
        likes: post.likes?.length || 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    })
  } catch (error) {
    console.error('[GET_POST_ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, excerpt, tags, published, image } = body

    await connectToDatabase()

    const post = await Post.findById(id)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user is the author
    if (post.author.toString() !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update fields
    if (title !== undefined) {
      post.title = title
      // Regenerate slug if title changed
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      let slug = baseSlug
      let counter = 1
      while (await Post.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      post.slug = slug
    }
    if (content !== undefined) post.content = content
    if (excerpt !== undefined) post.excerpt = excerpt
    if (tags !== undefined) post.tags = tags
    if (published !== undefined) post.published = published
    if (image !== undefined) post.image = image

    await post.save()

    const updatedPost = await Post.findById(id)
      .populate('author', 'name email avatar')
      .lean()

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPost!._id.toString(),
        title: updatedPost!.title,
        content: updatedPost!.content,
        excerpt: updatedPost!.excerpt,
        author: (updatedPost!.author as any).name,
        authorId: (updatedPost!.author as any)._id.toString(),
        tags: updatedPost!.tags,
        published: updatedPost!.published,
        slug: updatedPost!.slug,
        image: updatedPost!.image,
        views: updatedPost!.views,
        likes: updatedPost!.likes?.length || 0,
        createdAt: updatedPost!.createdAt,
        updatedAt: updatedPost!.updatedAt,
      },
    })
  } catch (error) {
    console.error('[UPDATE_POST_ERROR]', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
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

    // Check if user is the author
    if (post.author.toString() !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await Post.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('[DELETE_POST_ERROR]', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
