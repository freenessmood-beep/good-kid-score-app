import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Bunny Adventure | 乖寶寶記分',
  description: 'Track your children\'s good behavior with cute bunny characters and carrot points!',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: '/favicon.svg',
  },
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
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
