import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Post from '@/lib/models/post'
import { authenticateRequest } from '@/lib/auth'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const tag = searchParams.get('tag')
    const authorId = searchParams.get('authorId')
    const published = searchParams.get('published')
    const limit = 10
    const skip = (page - 1) * limit

    await connectToDatabase()

    const query: any = {}
    
    // If published param is not set, default to published: true for public access
    if (published === null || published === undefined) {
      query.published = true
    } else if (published === 'false') {
      query.published = false
    } else if (published === 'true') {
      query.published = true
    }
    
    if (tag) {
      query.tags = { $in: [tag] }
    }
    
    if (authorId) {
      // Validate ObjectId format
      if (mongoose.Types.ObjectId.isValid(authorId)) {
        query.author = new mongoose.Types.ObjectId(authorId)
      } else {
        return NextResponse.json({ error: 'Invalid authorId' }, { status: 400 })
      }
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ])

    const formattedPosts = posts.map((post: any) => ({
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author.name,
      authorId: post.author._id.toString(),
      tags: post.tags,
      published: post.published,
      slug: post.slug,
      image: post.image,
      views: post.views,
      likes: post.likes?.length || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[GET_POSTS_ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, excerpt, tags, published, image } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const authorId = auth.userId

    await connectToDatabase()

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Ensure unique slug
    let slug = baseSlug
    let counter = 1
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const post = await Post.create({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200),
      author: authorId,
      tags: tags || [],
      published: published || false,
      slug,
      image,
      views: 0,
      likes: [],
    })

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar')
      .lean()

    return NextResponse.json(
      {
        success: true,
        data: {
          id: populatedPost!._id.toString(),
          title: populatedPost!.title,
          content: populatedPost!.content,
          excerpt: populatedPost!.excerpt,
          author: (populatedPost!.author as any).name,
          authorId: (populatedPost!.author as any)._id.toString(),
          tags: populatedPost!.tags,
          published: populatedPost!.published,
          slug: populatedPost!.slug,
          image: populatedPost!.image,
          views: populatedPost!.views,
          likes: populatedPost!.likes?.length || 0,
          createdAt: populatedPost!.createdAt,
          updatedAt: populatedPost!.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[CREATE_POST_ERROR]', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
