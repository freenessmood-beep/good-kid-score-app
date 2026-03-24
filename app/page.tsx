'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Plus, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import BunnyCard from '@/components/BunnyCard'
import AddScoreModal from '@/components/AddScoreModal'
import AddChildModal from '@/components/AddChildModal'
import ExportAllReport from '@/components/ExportAllReport'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Child, ScoreEntry, Trade, RewardItem, User } from '@/lib/types'

export default function Dashboard() {
  const router = useRouter()
  const { t } = useLanguage()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [entries, setEntries] = useState<ScoreEntry[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [showAddChild, setShowAddChild] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [copied, setCopied] = useState(false)

  const supabase = createClient()

  const fetchData = async () => {
    const user = await getCurrentUser()
    if (!user) { router.push('/login'); return }
    setCurrentUser(user)

    const [
      { data: kids },
      { data: scoreData },
      { data: tradesData },
      { data: rewardsData },
    ] = await Promise.all([
      supabase.from('children').select('*').order('created_at'),
      supabase.from('score_entries').select('*'),
      supabase.from('trades').select('*'),
      supabase.from('reward_items').select('*'),
    ])

    setChildren(kids || [])
    setEntries(scoreData || [])
    setTrades(tradesData || [])
    setRewards(rewardsData || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleGenerateCode = async () => {
    if (!currentUser) return
    setInviteLoading(true)
    setGeneratedCode('')
    setInviteError('')

    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error } = await supabase.from('invitations').insert({
      code,
      created_by: currentUser.id,
    })

    if (error) setInviteError(error.message)
    else setGeneratedCode(code)
    setInviteLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
      <Navbar currentUser={currentUser} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-app-text mb-1">{t('appName')}</h1>
          <p className="text-app-text/60 text-lg">{t('appSubtitle')}</p>
        </div>

        {/* Month switcher */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)}
              className="p-2 rounded-xl hover:bg-lavender/40 text-app-text transition">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-app-text min-w-[180px] text-center">
              {monthLabel} {t('monthSummary')}
            </h2>
            <button onClick={() => changeMonth(1)} disabled={isCurrentMonth}
              className="p-2 rounded-xl hover:bg-lavender/40 text-app-text transition disabled:opacity-30">
              <ChevronRight size={20} />
            </button>
          </div>
          {currentUser?.role === 'owner' && (
            <div className="flex gap-2">
              <button
                onClick={() => { setShowInvite(!showInvite); setGeneratedCode(''); setInviteError('') }}
                className="flex items-center gap-1 text-sm bg-lavender text-app-text font-semibold px-3 py-2 rounded-2xl hover:bg-lavender/70 transition"
              >
                <UserPlus size={16} /> {t('inviteViewer')}
              </button>
              <button
                onClick={() => setShowAddChild(true)}
                className="flex items-center gap-1 text-sm bg-primary text-white font-semibold px-3 py-2 rounded-2xl hover:bg-primary/80 transition"
              >
                <Plus size={16} /> {t('addBunny')}
              </button>
            </div>
          )}
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

        {/* Invite code panel */}
        {showInvite && currentUser?.role === 'owner' && (
          <div className="bg-white rounded-3xl border-2 border-lavender p-5 mb-6 space-y-4">
            <h3 className="font-bold text-app-text">{t('invitePanelTitle')}</h3>
            <p className="text-app-text/50 text-sm">
              {t('invitePanelDesc')} <strong>{t('invitePanelViewer')}</strong>.
            </p>

            {inviteError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 text-red-600 text-sm">
                {inviteError}
              </div>
            )}

            {!generatedCode ? (
              <button
                onClick={handleGenerateCode}
                disabled={inviteLoading}
                className="px-5 py-2.5 rounded-2xl bg-lavender text-app-text font-bold hover:bg-lavender/70 transition disabled:opacity-50"
              >
                {inviteLoading ? t('generating') : t('generateInviteCode')}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-lemon rounded-2xl px-4 py-3 text-center">
                    <span className="text-3xl font-bold tracking-widest text-app-text">{generatedCode}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary text-app-text font-semibold hover:bg-secondary/70 transition"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? t('copied') : t('copy')}
                  </button>
                  <button
                    onClick={handleGenerateCode}
                    disabled={inviteLoading}
                    className="px-4 py-3 rounded-2xl border-2 border-lavender text-app-text/60 font-semibold hover:bg-lavender/20 transition text-sm disabled:opacity-50"
                  >
                    {t('newCode')}
                  </button>
                </div>
                <p className="text-xs text-app-text/40">{t('inviteCodeHintText')}</p>
              </div>
            )}
          </div>
        )}

        {/* Bunny Grid */}
        {children.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐰</div>
            <p className="text-app-text/60 text-lg font-semibold">{t('noBunniesYet')}</p>
            {currentUser?.role === 'owner' && (
              <p className="text-app-text/40 mt-1">{t('noBunniesHint')}</p>
            )}
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
                currentUser={currentUser}
                onAddScore={setSelectedChild}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedChild && currentUser && (
        <AddScoreModal
          child={selectedChild}
          currentUser={currentUser}
          onClose={() => setSelectedChild(null)}
          onSuccess={fetchData}
        />
      )}
      {showAddChild && currentUser && (
        <AddChildModal
          currentUser={currentUser}
          onClose={() => setShowAddChild(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
