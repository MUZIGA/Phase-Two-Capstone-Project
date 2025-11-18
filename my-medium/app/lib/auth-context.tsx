'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
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
    }

    loadUser()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call - Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock validation
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Check if user exists in localStorage (mock database)
      const users: (User & { password: string })[] = JSON.parse(localStorage.getItem('users') || '[]')
      const existingUser = users.find((u) => u.email === email)

      if (!existingUser) {
        throw new Error('User not found. Please sign up first.')
      }

      if (existingUser.password !== password) {
        throw new Error('Invalid password')
      }

      // Create user object (without password)
      const { password: _, ...userWithoutPassword } = existingUser
      const authenticatedUser: User = userWithoutPassword

      // Save to state and localStorage
      setUser(authenticatedUser)
      localStorage.setItem('auth_user', JSON.stringify(authenticatedUser))
      localStorage.setItem('auth_token', 'mock_jwt_token_' + Date.now())
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Validation
      if (!email || !password || !name) {
        throw new Error('All fields are required')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Check if user already exists
      const users: (User & { password: string })[] = JSON.parse(localStorage.getItem('users') || '[]')
      const existingUser = users.find((u) => u.email === email)

      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Create new user
      const newUser: User & { password: string } = {
        id: 'user_' + Date.now(),
        email,
        name,
        password, // In real app, this would be hashed
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        bio: '',
        createdAt: new Date().toISOString(),
      }

      // Save to mock database
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))

      // Remove password before setting user
      const { password: _, ...userWithoutPassword } = newUser
      const authenticatedUser: User = userWithoutPassword

      // Save to state and localStorage
      setUser(authenticatedUser)
      localStorage.setItem('auth_user', JSON.stringify(authenticatedUser))
      localStorage.setItem('auth_token', 'mock_jwt_token_' + Date.now())
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in')

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))

      // Update in users array
      const users: (User & { password: string })[] = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex((u) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...data }
        localStorage.setItem('users', JSON.stringify(users))
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
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

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
