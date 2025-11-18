'use client'

import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useAuth } from '../lib/auth-context'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  type: 'login' | 'signup'
  onSuccess?: () => void
}

export function AuthForm({ type, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { signup, login, isLoading } = useAuth()
  const router = useRouter()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (type === 'signup') {
        
        if (!name.trim()) {
          setError('Name is required')
          return
        }
        await signup(email, password, name)
      } else {
        
        await login(email, password)
      }
      
      
      router.push('/dashboard')
      onSuccess?.()
    } catch (err) {
      setError(type === 'signup' ? 'Signup failed. Please try again.' : 'Login failed. Please try again.')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        {type === 'signup' ? 'Create Account' : 'Sign In'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {type === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
          </div>
        )}

    
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
            required
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
            required
          />
        </div>

        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
            {error}
          </div>
        )}

        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : type === 'signup' ? 'Create Account' : 'Sign In'}
        </Button>
      </form>

      
      <p className="text-center text-muted-foreground text-sm mt-4">
        {type === 'signup' ? (
          <>
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </>
        ) : (
          <>
            Dont have an account?{' '}
            <a href="/signup" className="text-primary hover:underline">
              Create one
            </a>
          </>
        )}
      </p>
    </Card>
  )
}
