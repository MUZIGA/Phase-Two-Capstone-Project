import { notFound } from 'next/navigation'
import Link from 'next/link'
// import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/follow-button'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'
import Post from '@/lib/models/post'

type ProfilePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
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

  const [posts, followersCount, followingCount] = await Promise.all([
    Post.countDocuments({ author: id, published: true }),
    User.countDocuments({ following: id }),
    User.findById(id).select('following').then(u => u?.following?.length || 0)
  ])

  const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt || new Date().toISOString())

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-900 text-3xl font-semibold text-white">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
          <p className="text-gray-600 mb-4">{user.email}</p>
          <FollowButton userId={id} />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-gray-900">{posts}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <Link href={`/profile/${id}/followers`} className="p-4 hover:bg-gray-50 rounded-lg transition">
            <div className="text-2xl font-bold text-gray-900">{followersCount}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </Link>
          <Link href={`/profile/${id}/following`} className="p-4 hover:bg-gray-50 rounded-lg transition">
            <div className="text-2xl font-bold text-gray-900">{followingCount}</div>
            <div className="text-sm text-gray-600">Following</div>
          </Link>
        </div>

        <div className="space-y-6">
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 leading-relaxed">{user.bio || 'No bio provided yet.'}</p>
            <p className="text-sm text-gray-500 mt-4">Member since {createdAt.toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  )
}

