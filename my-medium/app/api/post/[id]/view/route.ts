import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Post from '@/lib/models/post'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await connectToDatabase()

    await Post.findByIdAndUpdate(id, {
      $inc: { views: 1 }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[INCREMENT_VIEW_ERROR]', error)
    return NextResponse.json({ error: 'Failed to increment view' }, { status: 500 })
  }
}