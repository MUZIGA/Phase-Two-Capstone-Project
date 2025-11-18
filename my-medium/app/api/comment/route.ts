import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  // Mock API response
  await new Promise(resolve => setTimeout(resolve, 200))

  return NextResponse.json({
    success: true,
    data: [],
    postId
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  // Mock API response - validate input, save to DB, return created comment
  await new Promise(resolve => setTimeout(resolve, 300))

  return NextResponse.json({
    success: true,
    data: { ...body, id: Math.random().toString(), createdAt: new Date() }
  }, { status: 201 })
}
