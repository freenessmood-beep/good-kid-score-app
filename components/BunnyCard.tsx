'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import BunnySVG from './BunnySVG'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAvailableCarrots } from '@/lib/balance'
import type { Child, ScoreEntry, Trade, User } from '@/lib/types'

interface BunnyCardProps {
  child: Child
  entries: ScoreEntry[]
  trades: Trade[]
  month: string // "YYYY-MM"
  currentUser: User | null
  onAddScore: (child: Child) => void
}

export default function BunnyCard({ child, entries, trades, month, currentUser, onAddScore }: BunnyCardProps) {
  const { t } = useLanguage()
  const monthEarned = entries.filter(e => e.date.startsWith(month)).reduce((sum, e) => sum + e.points, 0)
  const available = getAvailableCarrots(child.id, entries, trades)
  const isOwner = currentUser?.role === 'owner'

  return (
    <div className="bg-white rounded-3xl shadow-md border-2 border-primary/20 p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow">
      <Link href={`/child/${child.id}`} className="flex flex-col items-center gap-3 w-full">
        <BunnySVG color={child.bunny_color} size={100} />
        <h2 className="text-xl font-bold text-app-text">{child.name}</h2>
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="flex items-center gap-2 bg-lemon rounded-2xl px-4 py-2 w-full justify-center">
            <span className="text-xl">🥕</span>
            <span className="text-xl font-bold text-app-text">{monthEarned}</span>
            <span className="text-app-text/50 text-sm">{t('earnedThisMonth')}</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/40 rounded-2xl px-4 py-2 w-full justify-center">
            <span className="text-xl">💰</span>
            <span className="text-xl font-bold text-app-text">{available}</span>
            <span className="text-app-text/50 text-sm">{t('availableTotal')}</span>
          </div>
        </div>
      </Link>

      {isOwner && (
        <button
          onClick={() => onAddScore(child)}
          className="flex items-center gap-2 bg-secondary text-app-text font-semibold px-4 py-2 rounded-2xl hover:bg-secondary/80 transition w-full justify-center mt-1"
        >
          <Plus size={18} />
          {t('addScore')}
        </button>
      )}
    </div>
  )
}
