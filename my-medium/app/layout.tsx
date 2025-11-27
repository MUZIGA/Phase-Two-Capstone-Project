import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from './lib/auth-context'
import { ReactQueryProvider } from './lib/react-query'
import { SearchProvider } from './lib/search-context'
import { PostProvider } from './lib/post-context'
import { SocialProvider } from './lib/social-context'
import { Header } from './components/header'
import { Footer } from './components/footer'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-geist'
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-geist-mono'
});

export const metadata: Metadata = {
  title: {
    default: 'WriteHub - Publishing Platform',
    template: '%s | WriteHub'
  },
  description: 'Discover and share stories, ideas, and insights from writers and developers.',
  keywords: 'writing, publishing, developers, stories, tutorials, blog, community',
  authors: [{ name: 'WriteHub Team' }],
  creator: 'WriteHub',
  publisher: 'WriteHub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',

}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <ReactQueryProvider>
          <AuthProvider>
            <PostProvider>
              <SocialProvider>
                <SearchProvider>
                  <Header />
                  <div className="flex-1">
                    {children}
                  </div>
                  <Footer />
                </SearchProvider>
              </SocialProvider>
            </PostProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
