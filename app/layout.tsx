import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: 'Good Kid Score App | 乖寶寶記分',
  description: 'Track your children\'s good behavior with cute bunny characters and carrot points!',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-baloo">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
