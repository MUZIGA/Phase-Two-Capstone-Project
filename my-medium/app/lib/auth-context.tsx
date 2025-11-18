'use client'

import React, { createContext, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  bio?: string
  avatar?: string
}


interface AuthContextType {
  user: User | null
  isLoading: boolean
  signup: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (bio: string) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)


  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {

      await new Promise(resolve => setTimeout(resolve, 1000))
      
    
      const newUser: User = {
        id: Math.random().toString(),
        email,
        name,
        bio: ''
      }
      
    
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
     
      const loggedInUser: User = {
        id: Math.random().toString(),
        email,
        name: email.split('@')[0],
        bio: ''
      }
      
      localStorage.setItem('user', JSON.stringify(loggedInUser))
      setUser(loggedInUser)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  
  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  
  const updateProfile = (bio: string) => {
    if (user) {
      const updatedUser = { ...user, bio }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
