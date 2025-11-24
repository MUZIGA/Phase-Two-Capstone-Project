'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FollowButton } from '../../../components/follow-button'

import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'

type FollowingPageProps = {
  params: Promise<{
    id: string
  }>
}

export default function FollowingPage({ params }: FollowingPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [following, setFollowing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (!resolvedParams) return

    const fetchData = async () => {
      try {
        await connectToDatabase()
        const userData = await User.findById(resolvedParams.id).populate('following', 'name email').lean()

        if (!userData) {
          notFound()
        }

        setUser(userData)
        setFollowing(userData.following || [])
      } catch (error) {
        console.error('Error fetching following:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams])

  if (loading) {
    return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    </div>
    )
  }

  if (!user) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <Link
            href={`/profile/${user._id}`}
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            {user.name}&apos;s Following ({following.length})
          </h1>
        </div>

        {following.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Not following anyone yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {following.map((followedUser: any) => (
              <div key={followedUser._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {followedUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{followedUser.name}</h3>
                    <p className="text-slate-600">{followedUser.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/profile/${followedUser._id}`}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View Profile
                  </Link>
                  <FollowButton userId={followedUser._id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
