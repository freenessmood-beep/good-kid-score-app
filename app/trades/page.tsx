'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import BunnySVG from '@/components/BunnySVG'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAvailableCarrots } from '@/lib/balance'
import type { Child, RewardItem, Trade, ScoreEntry, User } from '@/lib/types'

export default function TradesPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [entries, setEntries] = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Trade form
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [formChild, setFormChild] = useState('')
  const [formReward, setFormReward] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formNote, setFormNote] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const supabase = createClient()

  const fetchData = async () => {
    const user = await getCurrentUser()
    if (!user) { router.push('/login'); return }
    setCurrentUser(user)

    const [
      { data: kidsData },
      { data: rewardsData },
      { data: tradesData },
      { data: entriesData },
    ] = await Promise.all([
      supabase.from('children').select('*').order('name'),
      supabase.from('reward_items').select('*').order('carrot_threshold'),
      supabase.from('trades').select('*').order('date', { ascending: false }),
      supabase.from('score_entries').select('*'),
    ])

    setChildren(kidsData || [])
    setRewards(rewardsData || [])
    setTrades(tradesData || [])
    setEntries(entriesData || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleRewardSelect = (rewardId: string) => {
    setFormReward(rewardId)
  }

  const getAvail = (childId: string) =>
    getAvailableCarrots(childId, entries, trades)

  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!formChild) { setFormError('Please select a bunny.'); return }
    if (!formReward) { setFormError('Please select a reward.'); return }

    const selectedReward = rewards.find(r => r.id === formReward)!
    const available = getAvail(formChild)
    if (selectedReward.carrot_threshold > available) {
      setFormError(`Not enough carrots! ${children.find(c => c.id === formChild)?.name} only has 🥕 ${available} available.`)
      return
    }

    setFormLoading(true)
    const { error } = await supabase.from('trades').insert({
      child_id: formChild,
      reward_item_id: formReward,
      reward_description: selectedReward.reward_description,
      carrots_spent: selectedReward.carrot_threshold,
      date: formDate,
      note: formNote || null,
      created_by: currentUser!.id
    })

    if (error) setFormError(error.message)
    else {
      setShowTradeModal(false)
      setFormChild(''); setFormReward(''); setFormNote('')
      fetchData()
    }
    setFormLoading(false)
  }

  const handleDeleteTrade = async (id: string) => {
    await supabase.from('trades').delete().eq('id', id)
    fetchData()
  }

  const isOwner = currentUser?.role === 'owner'

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-6xl animate-bounce">🛒</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentUser={currentUser} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛒</div>
          <h1 className="text-3xl font-bold text-app-text">{t('tradesTitle')}</h1>
          <p className="text-app-text/60 mt-1">{t('tradesSubtitle')}</p>
        </div>

        {/* Carrot balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {children.map(child => {
            const earned = entries.filter(e => e.child_id === child.id).reduce((s, e) => s + e.points, 0)
            const available = getAvail(child.id)
            const totalSpent = earned - available
            return (
              <div key={child.id} className="bg-white rounded-3xl border-2 border-primary/20 p-4 flex items-center gap-3">
                <BunnySVG color={child.bunny_color} size={60} />
                <div className="flex-1">
                  <p className="font-bold text-app-text">{child.name}</p>
                  <div className="flex gap-3 text-sm mt-1">
                    <span className="text-app-text/50">{t('earned')}: 🥕{earned}</span>
                    <span className="text-app-text/50">{t('spent')}: 🥕{totalSpent}</span>
                  </div>
                  <p className="text-lg font-bold text-app-text mt-0.5">
                    {t('available')}: <span className="text-green-600">🥕 {available}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Rewards Menu */}
        {rewards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-app-text mb-1">{t('rewardsMenu')}</h2>
            <p className="text-app-text/50 text-sm mb-3">{t('rewardsMenuSubtitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[...rewards].sort((a, b) => a.carrot_threshold - b.carrot_threshold).map(r => (
                <div key={r.id} className="bg-white rounded-2xl border-2 border-lavender px-4 py-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-lemon rounded-xl px-3 py-1 shrink-0">
                    <span className="text-lg font-bold text-app-text">{r.carrot_threshold}</span>
                    <span>🥕</span>
                  </div>
                  <span className="font-semibold text-app-text text-sm">{r.reward_description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trades list */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-app-text">{t('tradingRecords')}</h2>
          {isOwner && (
            <button
              onClick={() => setShowTradeModal(true)}
              className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-2xl hover:bg-primary/80 transition shadow"
            >
              <Plus size={18} /> {t('newTrade')}
            </button>
          )}
        </div>

        {trades.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-app-text/50 text-lg">{t('noTradesYet')}</p>
            {isOwner && <p className="text-app-text/40 text-sm mt-1">{t('noTradesHint')}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map(trade => {
              const child = children.find(c => c.id === trade.child_id)
              return (
                <div key={trade.id} className="bg-white rounded-2xl border-2 border-lavender px-4 py-3 flex items-center gap-3">
                  {child && <BunnySVG color={child.bunny_color} size={40} />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-app-text">{child?.name}</span>
                      <span className="text-app-text/40 text-sm">{new Date(trade.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="text-app-text/80 text-sm mt-0.5">🎁 {trade.reward_description}</p>
                    {trade.note && <p className="text-app-text/50 text-xs mt-0.5">{trade.note}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-50 text-red-500 font-bold px-3 py-1 rounded-xl text-sm">-🥕 {trade.carrots_spent}</span>
                    {isOwner && (
                      <button onClick={() => handleDeleteTrade(trade.id)}
                        className="p-1.5 rounded-xl hover:bg-red-50 text-app-text/40 hover:text-red-500 transition">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* New Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-primary/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-app-text">{t('newTradeTitle')}</h2>
              <button onClick={() => { setShowTradeModal(false); setFormError('') }} className="text-app-text/50 hover:text-app-text">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleTradeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">{t('childName')}</label>
                <select value={formChild} onChange={e => setFormChild(e.target.value)} required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text">
                  <option value="">{t('selectChild')}</option>
                  {children.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (🥕 {getAvail(c.id)} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">{t('reward')}</label>
                <select value={formReward} onChange={e => handleRewardSelect(e.target.value)} required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text">
                  <option value="">{t('selectChild')}</option>
                  {rewards.map(r => (
                    <option key={r.id} value={r.id}>{r.reward_description} (🥕 {r.carrot_threshold})</option>
                  ))}
                </select>
              </div>

              {formReward && (
                <div className="flex items-center gap-2 bg-lemon/50 border-2 border-lemon rounded-2xl px-4 py-3">
                  <span className="text-app-text/60 text-sm">{t('carrotsToSpend')}:</span>
                  <span className="text-2xl font-bold text-app-text">{rewards.find(r => r.id === formReward)?.carrot_threshold}</span>
                  <span className="text-xl">🥕</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">{t('date')}</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">{t('note')}</label>
                <input type="text" value={formNote} onChange={e => setFormNote(e.target.value)}
                  placeholder={t('noteTradePlaceholder')}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text" />
              </div>

              {formError && <p className="text-red-500 text-sm">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowTradeModal(false); setFormError('') }}
                  className="flex-1 py-3 rounded-2xl border-2 border-lavender text-app-text font-semibold hover:bg-lavender/20 transition">
                  {t('cancel')}
                </button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-3 rounded-2xl bg-primary text-white font-bold shadow hover:bg-primary/80 transition disabled:opacity-50">
                  {formLoading ? '⏳' : t('confirmTrade')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
