import { Post } from '@/lib/types'

interface JsonLdProps {
  post: Post
}

export function JsonLd({ post }: JsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160),
    image: post.image ? [post.image] : [],
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${baseUrl}/profile/${post.authorId}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'WriteHub',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.svg`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/posts/${post.slug}`
    },
    keywords: post.tags.join(', '),
    wordCount: post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    url: `${baseUrl}/posts/${post.slug}`
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}