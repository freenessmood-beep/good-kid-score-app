'use client'

import Link from 'next/link'
import { Plus, Copy } from 'lucide-react'
import { useState } from 'react'
import BunnySVG from './BunnySVG'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAvailableCarrots } from '@/lib/balance'
import type { Child, ScoreEntry, Trade } from '@/lib/types'

interface BunnyCardProps {
  child: Child
  entries: ScoreEntry[]
  trades: Trade[]
  month: string // "YYYY-MM"
  onAddScore: (child: Child) => void
}

export default function BunnyCard({ child, entries, trades, month, onAddScore }: BunnyCardProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const available = getAvailableCarrots(child.id, entries, trades)

  const handleCopyId = (e: React.MouseEvent) => {
    e.preventDefault()
    navigator.clipboard.writeText(child.public_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-3xl shadow-md border-2 border-primary/20 p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow">
      <Link href={`/child?id=${encodeURIComponent(child.id)}`} className="flex flex-col items-center gap-3 w-full">
        <BunnySVG color={child.bunny_color} size={100} />
        <h2 className="text-xl font-bold text-app-text">{child.name}</h2>
        {child.public_id && (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-app-text/50 bg-lemon/60 px-2 py-0.5 rounded-lg">{child.public_id}</span>
            <button onClick={handleCopyId} className="p-1 rounded-lg hover:bg-lavender/30 text-app-text/40 hover:text-app-text transition" title="Copy Bunny ID">
              <Copy size={12} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-secondary/40 rounded-2xl px-4 py-2 w-full justify-center">
          <span className="text-xl">💰</span>
          <span className="text-xl font-bold text-app-text">{available}</span>
          <span className="text-app-text/50 text-sm">{t('availableTotal')}</span>
        </div>
      </Link>

      <button
        onClick={() => onAddScore(child)}
        className="flex items-center gap-2 bg-secondary text-app-text font-semibold px-4 py-2 rounded-2xl hover:bg-secondary/80 transition w-full justify-center mt-1"
      >
        <Plus size={18} />
        {t('addScore')}
      </button>
    </div>
  )
}
