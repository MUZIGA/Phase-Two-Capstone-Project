'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  createdAt: string
}

type SignupOptions = {
  autoLogin?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, options?: SignupOptions) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_HEADERS = {
  'Content-Type': 'application/json',
}

async function handleApiResponse(response: Response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.error || 'Something went wrong. Please try again.'
    throw new Error(message)
  }
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('auth_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      if (!email || !password) {
        throw new Error('Email and password are required.')
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ email, password }),
      })

      const data = await handleApiResponse(response)

      const authenticatedUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
        bio: data.user.bio,
        createdAt: data.user.createdAt,
      }

      setUser(authenticatedUser)
      localStorage.setItem('auth_user', JSON.stringify(authenticatedUser))
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, options: SignupOptions = {}) => {
    const { autoLogin = false } = options
    setIsLoading(true)
    try {
      if (!email || !password || !name) {
        throw new Error('Name, email, and password are required.')
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ email, password, name }),
      })

      const data = await handleApiResponse(response)

      if (autoLogin) {
        const authenticatedUser: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          createdAt: data.user.createdAt,
        }

        setUser(authenticatedUser)
        localStorage.setItem('auth_user', JSON.stringify(authenticatedUser))
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in')

    setIsLoading(true)
    try {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
