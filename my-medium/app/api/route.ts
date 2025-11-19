import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Demo in-memory user store.
 * Replace with a real database in production.
 */
const users = new Map<string, { id: string; name: string; email: string; passwordHash: string; salt: string }>()

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

    if (users.has(email)) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    // PBKDF2 with salt — acceptable for demo; prefer argon2/bcrypt with a DB in production
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex')
    const id = crypto.randomUUID()

    users.set(email, { id, name, email, passwordHash: hash, salt })

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }
}