'use client'

import type { ReactNode } from 'react'
import { useStore } from '@/lib/store'
import TokenSetup from './TokenSetup'
import Footer from './Footer'

/**
 * Every page reads from the data repo, so nothing can render until this browser
 * has a token. Kept as a client component so the root layout stays a server one.
 */
export default function AppGate({ children }: { children: ReactNode }) {
  const { needsSetup } = useStore()

  if (needsSetup) return <TokenSetup />

  return (
    <>
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  )
}
