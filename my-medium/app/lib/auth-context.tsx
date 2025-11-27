'use client'

import  { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  let data: any = {}
  try {
    data = await response.json()
  } catch {
    data = {}
  }
  if (!response.ok) {
    const serverMessage =
      typeof data?.error === 'string' ? data.error :
      typeof data?.message === 'string' ? data.message :
      response.statusText || 'Request failed'
    const message = `${serverMessage} (${response.status})`
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
      
      // Store JWT token if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      } else {
        // Try to get token from response header
        const authHeader = response.headers.get('Authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
          localStorage.setItem('auth_token', authHeader.substring(7))
        }
      }
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
    localStorage.removeItem('auth_token')
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in')

    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await handleApiResponse(response)
      const updatedUser = result.user
      
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
