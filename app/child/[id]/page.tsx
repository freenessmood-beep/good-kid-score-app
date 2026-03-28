'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import BunnySVG from '@/components/BunnySVG'
import AddScoreModal from '@/components/AddScoreModal'
import ExportReport from '@/components/ExportReport'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAvailableCarrots } from '@/lib/balance'
import type { Child, ScoreEntry, RewardItem, User, Trade } from '@/lib/types'

export default function ChildDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { t } = useLanguage()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [child, setChild] = useState<Child | null>(null)
  const [allEntries, setAllEntries] = useState<ScoreEntry[]>([])
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddScore, setShowAddScore] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editEntry, setEditEntry] = useState<ScoreEntry | null>(null)
  const [editPoints, setEditPoints] = useState(1)
  const [editNote, setEditNote] = useState('')
  const [editDate, setEditDate] = useState('')
  const [copiedId, setCopiedId] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const supabase = createClient()

  const fetchData = async () => {
    const user = await getCurrentUser()
    if (!user) { router.push('/login'); return }
    setCurrentUser(user)

    const [
      { data: childData },
      { data: entriesData },
      { data: rewardData },
      { data: tradesData },
    ] = await Promise.all([
      supabase.from('children').select('*').eq('id', id).single(),
      supabase.from('score_entries').select('*').eq('child_id', id).order('date', { ascending: false }),
      supabase.from('reward_items').select('*').order('carrot_threshold'),
      supabase.from('trades').select('*').eq('child_id', id),
    ])

    if (!childData) { router.push('/dashboard'); return }
    setChild(childData)
    setAllEntries(entriesData || [])
    setRewards(rewardData || [])
    setTrades(tradesData || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const monthEntries = allEntries.filter(e => e.date.startsWith(currentMonth))
  const totalCarrots = monthEntries.reduce((sum, e) => sum + e.points, 0)
  const isOwner = currentUser?.role === 'owner'

  const availableCarrots = getAvailableCarrots(id, allEntries, trades)

  const earnedRewards = rewards.filter(r => r.carrot_threshold <= totalCarrots)

  const handleDeleteEntry = async (entryId: string) => {
    await supabase.from('score_entries').delete().eq('id', entryId)
    fetchData()
  }

  const handleEditStart = (entry: ScoreEntry) => {
    setEditEntry(entry)
    setEditPoints(entry.points)
    setEditNote(entry.note || '')
    setEditDate(entry.date)
  }

  const handleEditSave = async () => {
    if (!editEntry) return
    await supabase.from('score_entries').update({
      points: editPoints,
      note: editNote || null,
      date: editDate
    }).eq('id', editEntry.id)
    setEditEntry(null)
    fetchData()
  }

  const handleDeleteBunny = async () => {
    setDeleting(true)
    await supabase.from('children').delete().eq('id', id)
    router.push('/dashboard')
  }

  const monthOptions = (() => {
    const opts = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      opts.push({ val, label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) })
    }
    return opts
  })()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-6xl animate-bounce">🐰</div>
      </div>
    )
  }

  if (!child) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentUser={currentUser} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-app-text/60 hover:text-app-text mb-6 font-semibold">
          <ArrowLeft size={18} /> {t('backToDashboard')}
        </Link>

        {/* Child header */}
        <div className="bg-white rounded-3xl border-2 border-primary/20 p-6 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <BunnySVG color={child.bunny_color} size={90} />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-app-text">{child.name}</h1>
            <div className="flex items-center gap-2 justify-center sm:justify-start mt-2">
              <span className="text-3xl">🥕</span>
              <span className="text-3xl font-bold text-app-text">{totalCarrots}</span>
              <span className="text-app-text/60">{t('carrots_this_month')}</span>
            </div>
            <p className="text-sm text-green-600 font-semibold mt-1">{t('available')}: 🥕 {availableCarrots}</p>
            {/* Share ID */}
            {child.public_id && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs text-app-text/40">Bunny ID:</span>
                <span className="font-mono text-sm font-bold text-app-text bg-lemon px-2 py-0.5 rounded-lg">{child.public_id}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(child.public_id)
                    setCopiedId(true)
                    setTimeout(() => setCopiedId(false), 2000)
                  }}
                  className="p-1 rounded-lg hover:bg-lavender/30 text-app-text/50 hover:text-app-text transition"
                  title="Copy ID"
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <a
                  href={`/bunny/${child.public_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-lg hover:bg-lavender/30 text-app-text/50 hover:text-app-text transition"
                  title="Open public profile"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-2">
              <ExportReport child={child} entries={monthEntries} rewards={rewards} month={currentMonth} />
              {isOwner && (
                <button
                  onClick={() => setShowAddScore(true)}
                  className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-2xl hover:bg-primary/80 transition shadow"
                >
                  <Plus size={18} /> {t('addScore')}
                </button>
              )}
            </div>
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 text-red-400 hover:text-red-600 text-sm font-semibold transition"
              >
                <Trash2 size={14} /> {t('deleteBunny')}
              </button>
            )}
          </div>
        </div>

        {/* Earned Rewards */}
        {earnedRewards.length > 0 && (
          <div className="bg-secondary/30 rounded-3xl border-2 border-secondary p-4 mb-6">
            <h3 className="font-bold text-app-text mb-2">{t('rewardsEarnedTitle')}</h3>
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
          <h2 className="text-xl font-bold text-app-text">{t('scoreHistory')}</h2>
          <select
            value={currentMonth}
            onChange={e => setCurrentMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border-2 border-lavender outline-none text-app-text text-sm bg-white"
          >
            {monthOptions.map(o => (
              <option key={o.val} value={o.val}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Entries list */}
        <div className="space-y-3">
          {monthEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-app-text/50 text-lg">{t('noEntriesThisMonth')}</p>
              {isOwner && <p className="text-app-text/40 text-sm mt-1">{t('noEntriesHint')}</p>}
            </div>
          ) : (
            monthEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl border-2 border-lavender px-4 py-3">
                {editEntry?.id === entry.id ? (
                  <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                      <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border-2 border-lavender outline-none text-sm text-app-text" />
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditPoints(Math.max(1, editPoints - 1))}
                          className="w-8 h-8 rounded-full bg-lavender text-app-text font-bold hover:bg-lavender/70">-</button>
                        <span className="w-8 text-center font-bold text-app-text">{editPoints}</span>
                        <button onClick={() => setEditPoints(editPoints + 1)}
                          className="w-8 h-8 rounded-full bg-secondary text-app-text font-bold hover:bg-secondary/70">+</button>
                        <span>🥕</span>
                      </div>
                    </div>
                    <input type="text" value={editNote} onChange={e => setEditNote(e.target.value)}
                      placeholder="Note (optional)"
                      className="w-full px-3 py-1.5 rounded-xl border-2 border-lavender outline-none text-sm text-app-text" />
                    <div className="flex gap-2">
                      <button onClick={handleEditSave} className="flex items-center gap-1 text-green-600 font-semibold text-sm hover:text-green-800">
                        <Check size={16} /> {t('save')}
                      </button>
                      <button onClick={() => setEditEntry(null)} className="flex items-center gap-1 text-app-text/50 text-sm hover:text-app-text">
                        <X size={16} /> {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
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
                    {isOwner && (
                      <div className="flex gap-1">
                        <button onClick={() => handleEditStart(entry)} className="p-1.5 rounded-xl hover:bg-lavender/30 text-app-text/40 hover:text-app-text transition">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-app-text/40 hover:text-red-500 transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {showAddScore && currentUser && (
        <AddScoreModal
          child={child}
          currentUser={currentUser}
          onClose={() => setShowAddScore(false)}
          onSuccess={fetchData}
          currentMonthEarned={totalCarrots}
        />
      )}

      {/* Delete Bunny Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-red-200 p-6 w-full max-w-sm text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold text-app-text mb-2">{t('deleteBunny')}</h2>
            <p className="text-app-text/60 text-sm mb-6">{t('deleteBunnyConfirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-lavender text-app-text font-semibold hover:bg-lavender/20 transition"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteBunny}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold shadow hover:bg-red-600 transition disabled:opacity-50"
              >
                {deleting ? t('deleting') : t('deleteBunny')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
