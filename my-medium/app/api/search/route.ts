import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Post from '@/lib/models/post'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ data: [] })
    }

    await connectToDatabase()

    const searchRegex = new RegExp(query.trim(), 'i')
    
    const posts = await Post.find({
      published: true,
      deleted: { $ne: true },
      $or: [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { excerpt: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } }
      ]
    })
    .populate('author', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

    const formatted = posts.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      content: p.content,
      excerpt: p.excerpt,
      author: p.author?.name || 'Unknown',
      authorId: p.author?._id?.toString() || '',
      authorAvatar: p.author?.avatar,
      tags: p.tags || [],
      published: p.published,
      slug: p.slug,
      image: p.image,
      views: p.views || 0,
      likes: p.likes?.length || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))

    return NextResponse.json({ 
      success: true,
      data: formatted,
      total: formatted.length
    })
  } catch (error) {
    console.error('[SEARCH_ERROR]', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}