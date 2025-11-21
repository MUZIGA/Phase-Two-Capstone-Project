import { notFound } from 'next/navigation'
import Link from 'next/link'

import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'

type FollowersPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { id } = await params

  await connectToDatabase()
  const user = await User.findById(id).populate('followers', 'name email').lean()

  if (!user) {
    notFound()
  }

  const followers = user.followers || []

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <Link
            href={`/profile/${id}`}
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            {user.name}'s Followers ({followers.length})
          </h1>
        </div>

        {followers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No followers yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {followers.map((follower: any) => (
              <div key={follower._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {follower.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{follower.name}</h3>
                    <p className="text-slate-600">{follower.email}</p>
                  </div>
                </div>
                <Link
                  href={`/profile/${follower._id}`}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
