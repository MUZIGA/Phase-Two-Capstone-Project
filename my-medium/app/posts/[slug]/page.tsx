import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from "../../components/ui/button"
import Image from "next/image"
import { JsonLd } from "../../components/json-ld"
import { ClientInteractions } from "./client-interactions"
import Link from "next/link"
import type { Post } from '@/lib/types'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const url = `${baseUrl}/api/post?slug=${encodeURIComponent(slug)}&published=true`
    console.log('Fetching post from:', url)
    
    const response = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      console.error(`Failed to fetch post: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    console.log('Post data:', data)
    return data.success && data.data?.length > 0 ? data.data[0] : null
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const postUrl = `${baseUrl}/posts/${post.slug}`
  
  return {
    title: `${post.title} | WriteHub`,
    description: post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160),
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160),
      url: postUrl,
      siteName: 'WriteHub',
      images: post.image ? [{
        url: post.image,
        width: 1200,
        height: 630,
        alt: post.title
      }] : [],
      locale: 'en_US',
      type: 'article',
      publishedTime: new Date(post.createdAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: [post.author],
      tags: post.tags
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160),
      images: post.image ? [post.image] : [],
      creator: `@${post.author.replace(/\s+/g, '').toLowerCase()}`
    },
    alternates: {
      canonical: postUrl
    }
  }
}

export async function generateStaticParams() {
  // Return empty array to generate pages on-demand
  return []
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post || !post.published) {
    notFound()
  }

  // Skip view counting for now to avoid issues



  return (
    <>
      <JsonLd post={post} />
      <main className="min-h-screen bg-background">
      {post.image && (
        <div className="w-full h-80 relative">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="text-primary hover:text-primary/80 transition mb-6 inline-block"
        >
          ← Back to Home
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  {post.author[0]}
                </span>
              </div>

              <div>
                <p className="font-medium text-foreground">{post.author}</p>
                <p className="text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {post.views !== undefined && (
              <>
                <span className="hidden sm:inline">•</span>
                <p className="text-sm">{post.views} views</p>
              </>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}


        </header>

        <div className="prose prose-invert max-w-none mb-12">
          <div
            className="text-foreground leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <div className="border-t border-border pt-8 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">
                {post.author[0]}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">{post.author}</h3>

              <p className="text-muted-foreground text-sm mb-3">
                Full-stack developer and technical writer passionate about
                sharing knowledge.
              </p>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/profile/${post.authorId}`}>View Profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ClientInteractions postId={post.id} authorId={post.authorId} />
      </article>
    </main>
    </>
  );
}
