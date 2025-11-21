import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'
import { generateToken, createAuthResponse } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    })

    return createAuthResponse(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
        },
        token,
      },
      200,
      token
    )
  } catch (error) {
    console.error('[LOGIN_ERROR]', error)
    return NextResponse.json({ error: 'Unable to sign in. Please try again.' }, { status: 500 })
  }
}

