import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function getAuthToken(request: NextRequest): string | null {
  // First try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Fallback to cookie if no header
  const cookie = request.cookies.get('auth_token')
  if (cookie) {
    return cookie.value
  }
  
  return null
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ userId: string; email: string } | null> {
  const token = getAuthToken(request)
  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  return payload
}

export function createAuthResponse(
  data: any,
  status: number = 200,
  token?: string
): NextResponse {
  const response = NextResponse.json(data, { status })
  if (token) {
    response.headers.set('Authorization', `Bearer ${token}`)
    // Also set as httpOnly cookie for API requests
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
  }
  return response
}

