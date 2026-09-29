import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { StoreProvider } from '@/lib/store'
import AppGate from '@/components/AppGate'

export const metadata: Metadata = {
  title: 'Bunny Adventure | 乖寶寶記分',
  description: 'Track your children\'s good behavior with cute bunny characters and carrot points!',
  icons: {
    icon: 'favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-baloo flex flex-col">
        <LanguageProvider>
          <StoreProvider>
            <AppGate>{children}</AppGate>
          </StoreProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
