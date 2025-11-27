import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'
import { generateToken, createAuthResponse } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 })
    }

    await connectToDatabase()

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      followers: [],
      following: [],
    })

    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
    })

    return createAuthResponse(
      {
        message: 'Account created successfully.',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          bio: newUser.bio,
          createdAt: newUser.createdAt,
        },
        token,
      },
      201,
      token
    )
  } catch (error) {
    console.error('[SIGNUP_ERROR]', error)
    return NextResponse.json({ error: 'Unable to create account. Please try again.' }, { status: 500 })
  }
}

