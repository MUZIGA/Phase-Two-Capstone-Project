import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from './lib/auth-context'
import { PostProvider } from './lib/post-context'
import { SearchProvider } from './lib/search-context'
import { SocialProvider } from './lib/social-context'
import { Header } from './components/header'
import { Footer } from './components/footer'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'WriteHub - Publishing Platform',
  description: 'Discover and share stories, ideas, and insights from writers and developers.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <PostProvider>
            <SearchProvider>
              <SocialProvider>
                <Header />
                <div className="flex-1">
                  {children}
                </div>
                <Footer />
              </SocialProvider>
            </SearchProvider>
          </PostProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
