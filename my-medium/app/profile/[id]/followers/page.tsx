import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/follow-button'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'

interface FollowersPageProps {
  params: Promise<{ id: string }>
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { id } = await params

  // Validate MongoDB ObjectId format
  if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
    notFound()
  }

  await connectToDatabase()
  const user = await User.findById(id).lean()
  
  if (!user) {
    notFound()
  }

  const followers = await User.find({ following: id })
    .select('name email avatar createdAt')
    .sort({ createdAt: -1 })
    .lean()

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <Link href={`/profile/${id}`} className="text-gray-600 hover:text-gray-900 mb-4 inline-block">
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Followers</h1>
          <p className="text-gray-600">{user.name}'s followers</p>
        </div>

        {followers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No followers yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {followers.map((follower) => (
              <div key={follower._id.toString()} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <Link href={`/profile/${follower._id}`} className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                    {follower.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{follower.name}</h3>
                    <p className="text-sm text-gray-600">{follower.email}</p>
                  </div>
                </Link>
                <FollowButton userId={follower._id.toString()} variant="outline" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}