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

    // For now, return a placeholder URL
    // In production, upload to Cloudinary/S3 and return the actual URL
    // Example Cloudinary integration:
    /*
    const cloudinary = require('cloudinary').v2
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error: any, result: any) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })
    
    return NextResponse.json({
      success: true,
      url: result.secure_url
    })
    */

    // Placeholder response - replace with actual upload logic
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

