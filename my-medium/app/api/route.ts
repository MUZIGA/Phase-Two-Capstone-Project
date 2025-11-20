import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '../lib/db'
import User from '../lib/models/user'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = body ?? {}

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password too short' }, { status: 400 })
    }

    await connectToDatabase()

    const exists = await User.findOne({ email }).lean()
    if (exists) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = new User({
      name,
      email,
      password: hash, 
    })
    await user.save()

    return NextResponse.json({ ok: true, id: user._id.toString() }, { status: 201 })
  } catch (err) {
    console.error('signup error', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}