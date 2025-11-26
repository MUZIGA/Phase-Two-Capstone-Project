import Link from 'next/link'
import { Button } from './components/ui/button'
import { HomeFeed } from './components/home-feed'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WriteHub - Publishing Platform for Developers and Writers',
  description: 'Discover and share stories, ideas, and insights from developers and writers. Join our community to publish your own content and engage with others.',
  keywords: 'writing, publishing, developers, stories, tutorials, blog, community',
  openGraph: {
    title: 'WriteHub - Publishing Platform',
    description: 'Discover and share stories, ideas, and insights from developers and writers.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    siteName: 'WriteHub',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WriteHub - Publishing Platform',
    description: 'Discover and share stories, ideas, and insights from developers and writers.',
  }
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      
      <section className="py-24 md:py-32 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            WriteHub
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            A clean, modern publishing platform for developers and writers to share ideas and stories.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3">
              <Link href="/explore">Explore Stories</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">
              <Link href="/write">Start Writing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <HomeFeed />
      </section>
      
      <section className="max-w-5xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-6 mx-auto">
            <span className="text-2xl">✍️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Rich Editor</h3>
          <p className="text-gray-600 leading-relaxed">Create beautiful content with our intuitive editor. Format text, add images, and publish with ease.</p>
        </div>
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-6 mx-auto">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Build Community</h3>
          <p className="text-gray-600 leading-relaxed">Connect with readers through comments, likes, and follows. Grow your audience organically.</p>
        </div>
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-6 mx-auto">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
          <p className="text-gray-600 leading-relaxed">Built with Next.js for optimal performance. Fast loading, SEO-optimized, and mobile-friendly.</p>
        </div>
      </section>

      
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Start Your Journey</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of writers and readers. Share your stories, discover new perspectives.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-white px-8 py-3">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      
      <section className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-400 text-sm">Built with Next.js • Powered by modern web technologies</p>
      </section>
    </main>
  )
}
