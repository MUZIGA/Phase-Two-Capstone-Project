import Link from 'next/link'
import Image from 'next/image'
import { Button } from './components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-indigo-600 border-b border-indigo-700">
        <div className="max-w-5xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Welcome to WriteHub
          </h1>
          <p className="text-lg md:text-xl leading-relaxed opacity-90 mb-8">
            A modern publishing platform where developers and writers share ideas,
            tutorials, and stories. Discover content you love and publish your own.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
              <Link href="/explore">Explore Stories</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white/40 hover:bg-white/10">
              <Link href="/write">Start Writing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 text-xl">✍️</div>
          <h3 className="font-semibold text-gray-900 mb-2">Create with a Rich Editor</h3>
          <p className="text-gray-600 text-sm">Format text, add images, and publish drafts or posts with ease using our rich text editor.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 text-xl">🚀</div>
          <h3 className="font-semibold text-gray-900 mb-2">Grow Your Audience</h3>
          <p className="text-gray-600 text-sm">Reach readers with tags and search. Engage with follows, likes, and comments.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 text-xl">⚡</div>
          <h3 className="font-semibold text-gray-900 mb-2">Fast by Default</h3>
          <p className="text-gray-600 text-sm">Built on Next.js and React. Optimized rendering, caching, and image performance.</p>
        </div>
      </section>

      {/* CTA for Auth */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Join the community</h2>
          <p className="text-gray-600 mb-8">Sign up to follow your favorite authors, clap for posts you love, and start writing your own.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Create an account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Teaser */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">
        <p className="text-sm">Built with Next.js • Deployed on Vercel • Open to contributions</p>
      </section>
    </main>
  )
}
