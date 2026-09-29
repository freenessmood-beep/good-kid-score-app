'use client'

import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import BunnyCard from '@/components/BunnyCard'
import AddScoreModal from '@/components/AddScoreModal'
import AddChildModal from '@/components/AddChildModal'
import ExportAllReport from '@/components/ExportAllReport'
import { useLanguage } from '@/contexts/LanguageContext'
import { useStore } from '@/lib/store'
import type { Child } from '@/lib/types'

export default function Dashboard() {
  const { t } = useLanguage()
  const { doc, loading, loadError } = useStore()
  const { children, score_entries: entries, trades, reward_items: rewards } = doc

  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [showAddChild, setShowAddChild] = useState(false)

  const todayMonth = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })()
  const [selectedMonth, setSelectedMonth] = useState(todayMonth)

  const changeMonth = (dir: number) => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + dir, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const isCurrentMonth = selectedMonth === todayMonth

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🐰</div>
          <p className="text-app-text/60 font-semibold">Loading bunnies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-app-text mb-1">{t('appName')}</h1>
          <p className="text-app-text/60 text-lg">{t('appSubtitle')}</p>
        </div>

        {loadError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 text-red-600 text-sm">
            <p className="font-semibold mb-1">{t('storageSetup')}</p>
            <p className="text-red-500/80 text-xs break-words">{loadError}</p>
          </div>
        )}

        {/* Month switcher */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)}
              className="p-2 rounded-xl hover:bg-lavender/40 text-app-text transition">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-app-text min-w-[110px] text-center">
              {monthLabel} {t('monthSummary')}
            </h2>
            <button onClick={() => changeMonth(1)} disabled={isCurrentMonth}
              className="p-2 rounded-xl hover:bg-lavender/40 text-app-text transition disabled:opacity-30">
              <ChevronRight size={20} />
            </button>
          </div>
          <button
            onClick={() => setShowAddChild(true)}
            className="flex items-center gap-1 text-sm bg-primary text-white font-semibold px-3 py-2 rounded-2xl hover:bg-primary/80 transition"
          >
            <Plus size={16} /> {t('addBunny')}
          </button>
        </div>

        {/* Export All PDF button */}
        {children.length > 0 && (
          <div className="flex justify-end mb-4">
            <ExportAllReport
              children={children}
              entries={entries}
              trades={trades}
              rewards={rewards}
              month={selectedMonth}
            />
          </div>
        )}

        {/* Bunny Grid */}
        {children.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐰</div>
            <p className="text-app-text/60 text-lg font-semibold">{t('noBunniesYet')}</p>
            <p className="text-app-text/40 mt-1">{t('noBunniesHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(child => (
              <BunnyCard
                key={child.id}
                child={child}
                entries={entries.filter(e => e.child_id === child.id)}
                trades={trades.filter(t => t.child_id === child.id)}
                month={selectedMonth}
                onAddScore={setSelectedChild}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedChild && (
        <AddScoreModal child={selectedChild} onClose={() => setSelectedChild(null)} />
      )}
      {showAddChild && <AddChildModal onClose={() => setShowAddChild(false)} />}
    </div>
  )
}
