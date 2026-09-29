'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BunnySVG from '@/components/BunnySVG'
import { useStore } from '@/lib/store'
import { getAvailableCarrots } from '@/lib/balance'
import type { ScoreEntry } from '@/lib/types'

function PublicBunny() {
  const public_id = useSearchParams().get('id') ?? ''
  const { doc, loading } = useStore()

  const child = doc.children.find(c => c.public_id === public_id) ?? null
  const entries: ScoreEntry[] = doc.score_entries
    .filter(e => child && e.child_id === child.id)
    .sort((a, b) => b.date.localeCompare(a.date))
  const trades = doc.trades.filter(t => child && t.child_id === child.id)
  const rewards = [...doc.reward_items].sort((a, b) => a.carrot_threshold - b.carrot_threshold)
  const notFound = !loading && !child

  const todayMonth = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })()
  const [currentMonth, setCurrentMonth] = useState(todayMonth)

  const changeMonth = (dir: number) => {
    const [y, m] = currentMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + dir, 1)
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const isCurrentMonth = currentMonth === todayMonth
  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-6xl animate-bounce">🐰</div>
      </div>
    )
  }

  if (notFound || !child) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-app-text mb-2">Bunny not found</h1>
        <p className="text-app-text/50 mb-6">No bunny with ID <span className="font-mono font-bold">{public_id}</span> exists.</p>
        <Link href="/" className="px-6 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary/80 transition shadow">
          Go Back Home
        </Link>
      </div>
    )
  }

  const monthEntries = entries.filter(e => e.date.startsWith(currentMonth))
  const totalCarrots = monthEntries.reduce((sum, e) => sum + e.points, 0)
  const availableCarrots = getAvailableCarrots(child.id, entries, trades)
  const earnedRewards = rewards.filter(r => r.carrot_threshold <= totalCarrots)

  return (
    <div className="min-h-screen bg-background">
      {/* Mini header */}
      <div className="bg-white border-b-2 border-primary/20 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-app-text/60 hover:text-app-text font-semibold">
            <span className="text-xl">🐰</span>
            <span className="text-sm">Good Kid Score App</span>
          </Link>
          <span className="text-xs text-app-text/30 font-mono">{child.public_id}</span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Child header card */}
        <div className="bg-white rounded-3xl border-2 border-primary/20 p-6 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <BunnySVG color={child.bunny_color} size={90} />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-app-text">{child.name}</h1>
            <div className="flex items-center gap-2 justify-center sm:justify-start mt-2">
              <span className="text-3xl">🥕</span>
              <span className="text-3xl font-bold text-app-text">{totalCarrots}</span>
              <span className="text-app-text/60">carrots this month</span>
            </div>
            <p className="text-sm text-green-600 font-semibold mt-1">Available: 🥕 {availableCarrots}</p>
          </div>
        </div>

        {/* Earned Rewards */}
        {earnedRewards.length > 0 && (
          <div className="bg-secondary/30 rounded-3xl border-2 border-secondary p-4 mb-6">
            <h3 className="font-bold text-app-text mb-2">🎉 Rewards Earned This Month!</h3>
            <div className="space-y-1">
              {earnedRewards.map(r => (
                <div key={r.id} className="flex items-center gap-2 text-app-text">
                  <span>🏆</span>
                  <span className="font-semibold">{r.reward_description}</span>
                  <span className="text-app-text/50 text-sm ml-auto">{r.carrot_threshold} 🥕</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Month selector */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-app-text">Score History</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-xl hover:bg-lavender/40 text-app-text transition">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-app-text px-2">{monthLabel}</span>
            <button onClick={() => changeMonth(1)} disabled={isCurrentMonth}
              className="p-1.5 rounded-xl hover:bg-lavender/40 text-app-text transition disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Entries list (read-only) */}
        <div className="space-y-3">
          {monthEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-app-text/50 text-lg">No entries for this month yet!</p>
            </div>
          ) : (
            monthEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl border-2 border-lavender px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-app-text">
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="bg-lemon rounded-xl px-2 py-0.5 font-bold text-app-text text-sm">🥕 ×{entry.points}</span>
                    </div>
                    {entry.note && <p className="text-app-text/60 text-sm mt-0.5">{entry.note}</p>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default function PublicBunnyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-6xl animate-bounce">🐰</div>
        </div>
      }
    >
      <PublicBunny />
    </Suspense>
  )
}
