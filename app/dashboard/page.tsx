'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight, Lock, X } from 'lucide-react'
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
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)
  const [currentPasscode, setCurrentPasscode] = useState('')
  const [newPasscode, setNewPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [passcodeMsg, setPasscodeMsg] = useState('')

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

  const handleSavePasscode = async () => {
    setPasscodeMsg('')
    if (currentUser?.passcode && currentPasscode !== currentUser.passcode) {
      setPasscodeMsg(t('wrongPasscode')); return
    }
    if (!/^\d{4}$/.test(newPasscode)) { setPasscodeMsg(t('passcodeInvalid')); return }
    if (newPasscode !== confirmPasscode) { setPasscodeMsg(t('passcodeMismatch')); return }
    await supabase.from('users').update({ passcode: newPasscode }).eq('id', currentUser!.id)
    setCurrentUser(u => u ? { ...u, passcode: newPasscode } : u)
    setPasscodeMsg(t('passcodeSet'))
    setCurrentPasscode(''); setNewPasscode(''); setConfirmPasscode('')
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowPasscodeModal(true); setPasscodeMsg('') }}
                className="flex items-center gap-1 text-sm bg-lavender text-app-text font-semibold px-3 py-2 rounded-2xl hover:bg-lavender/70 transition"
                title={t('setPasscode')}
              >
                <Lock size={16} /> {currentUser.passcode ? t('changePasscode') : t('setPasscode')}
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

      {showPasscodeModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-primary/30 p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-app-text">🔐 {currentUser?.passcode ? t('changePasscode') : t('setPasscode')}</h2>
              <button onClick={() => { setShowPasscodeModal(false); setCurrentPasscode(''); setNewPasscode(''); setConfirmPasscode(''); setPasscodeMsg('') }} className="text-app-text/50 hover:text-app-text"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              {currentUser?.passcode && (
                <div>
                  <label className="block text-sm font-semibold text-app-text mb-1">{t('enterPasscode')}</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={currentPasscode}
                    onChange={e => setCurrentPasscode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text text-center text-2xl tracking-widest"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">{t('passcodeLabel')}</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPasscode}
                  onChange={e => setNewPasscode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text text-center text-2xl tracking-widest"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">{t('confirmPasscodeLabel')}</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPasscode}
                  onChange={e => setConfirmPasscode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text text-center text-2xl tracking-widest"
                />
              </div>
              {passcodeMsg && (
                <p className={`text-sm text-center ${passcodeMsg.includes('🔐') ? 'text-green-600' : 'text-red-500'}`}>
                  {passcodeMsg}
                </p>
              )}
              <button
                onClick={handleSavePasscode}
                className="w-full py-3 rounded-2xl bg-primary text-white font-bold shadow hover:bg-primary/80 transition"
              >
                {t('setPasscode')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
