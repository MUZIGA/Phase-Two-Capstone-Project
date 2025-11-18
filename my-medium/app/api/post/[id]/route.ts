import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.i
  await new Promise(resolve => setTimeout(resolve, 200))

  return NextResponse.json({
    success: true,
    data: { id, title: 'Post Title', content: 'Post content...' }
  })
}
