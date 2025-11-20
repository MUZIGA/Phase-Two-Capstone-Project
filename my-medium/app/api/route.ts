import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '../lib/db' 

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

    const db = await getDb()
    const users = db.collection('users')

    const exists = await users.findOne({ email })
    if (exists) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const res = await users.insertOne({
      name,
      email,
      passwordHash: hash,
      createdAt: new Date()
    })

    return NextResponse.json({ ok: true, id: res.insertedId.toString() }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}