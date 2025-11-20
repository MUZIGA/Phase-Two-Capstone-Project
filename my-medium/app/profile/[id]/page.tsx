import { notFound } from 'next/navigation'

import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/user'

type ProfilePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params

  await connectToDatabase()
  const user = await User.findById(id).lean()

  if (!user) {
    notFound()
  }

  const createdAt =
    user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt || new Date().toISOString())

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-3xl font-semibold text-white">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-slate-600">{user.email}</p>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-100 p-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Bio</h2>
            <p className="text-slate-700">{user.bio || 'No bio provided yet.'}</p>
          </section>

          <section className="rounded-xl border border-slate-100 p-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Member Since</h2>
            <p className="text-slate-700">{createdAt.toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  )
}

