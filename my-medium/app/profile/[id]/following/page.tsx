import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/follow-button'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'

interface FollowingPageProps {
  params: Promise<{ id: string }>
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { id } = await params

  await connectToDatabase()
  const user = await User.findById(id)
    .populate('following', 'name email createdAt')
    .lean()
  
  if (!user) {
    notFound()
  }

  const following = user.following || []

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <Link href={`/profile/${id}`} className="text-gray-600 hover:text-gray-900 mb-4 inline-block">
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Following</h1>
          <p className="text-gray-600">{user.name} is following</p>
        </div>

        {following.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Not following anyone yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {following.map((followedUser: any) => (
              <div key={followedUser._id.toString()} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <Link href={`/profile/${followedUser._id}`} className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                    {followedUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{followedUser.name}</h3>
                    <p className="text-sm text-gray-600">{followedUser.email}</p>
                  </div>
                </Link>
                <FollowButton userId={followedUser._id.toString()} variant="outline" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}