import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '10'
  const offset = searchParams.get('offset') || '0'
  await new Promise(resolve => setTimeout(resolve, 300))

  return NextResponse.json({
    success: true,
    data: [],
    total: 0,
    limit: parseInt(limit),
    offset: parseInt(offset)
  })
}
