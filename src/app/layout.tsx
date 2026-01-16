import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Curatos DNA - Autonomous SaaS Development',
  description: 'AI-powered system for researching, validating, and building SaaS products',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={inter.className}>
        {/* Skip to main content link for keyboard users */}
        <a 
          href="#main-content" 
          className="skip-link"
        >
          Skip to main content
        </a>
        
        <ErrorBoundary>
          <OfflineIndicator />
          {children}
        </ErrorBoundary>
        
        {/* Live region for screen reader announcements */}
        <div 
          id="aria-live-region"
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        />
      </body>
    </html>
  )
}
