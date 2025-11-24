import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'


export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    
    const maxSize = 5 * 1024 * 1024 
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    

    
    const placeholderUrl = `https://via.placeholder.com/800x400?text=${encodeURIComponent(file.name)}`

    return NextResponse.json({
      success: true,
      url: placeholderUrl,
      message: 'Image upload endpoint ready. Configure Cloudinary/S3 for production.',
    })
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

