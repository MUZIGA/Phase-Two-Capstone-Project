'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { type?: 'signup' | 'login' }

export function AuthForm({ type = 'signup' }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    if (type === 'signup' && !name.trim()) return 'Name is required'
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return 'Valid email is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (type === 'signup' && password !== confirm) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setIsSubmitting(true)
    try {
      if (type === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data?.message || 'Signup failed')
          setIsSubmitting(false)
          return
        }
        router.push('/login')
      } else {
        // login flow placeholder
        router.push('/')
      }
    } catch (err) {
      setError('Network error')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
      {type === 'signup' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" type="text" />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" type="email" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" type="password" />
      </div>

      {type === 'signup' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Confirm password</label>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" type="password" />
        </div>
      )}

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-60">
        {isSubmitting ? (type === 'signup' ? 'Signing up...' : 'Signing in...') : (type === 'signup' ? 'Sign up' : 'Sign in')}
      </button>
    </form>
  )
}