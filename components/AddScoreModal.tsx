'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Child, User } from '@/lib/types'

interface AddScoreModalProps {
  child: Child
  currentUser: User
  onClose: () => void
  onSuccess: () => void
}

export default function AddScoreModal({ child, currentUser, onClose, onSuccess }: AddScoreModalProps) {
  const { t } = useLanguage()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [points, setPoints] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error } = await supabase.from('score_entries').insert({
      child_id: child.id,
      date,
      points,
      note: note || null,
      created_by: currentUser.id
    })

    if (error) setError(error.message)
    else { onSuccess(); onClose() }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl border-2 border-primary/30 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-app-text">🥕 {t('addScoreFor')} {child.name}</h2>
          <button onClick={onClose} className="text-app-text/50 hover:text-app-text">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-app-text mb-1">{t('date')}</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-app-text mb-1">{t('carrotsLabel')}</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setPoints(Math.max(1, points - 1))}
                className="w-10 h-10 rounded-full bg-lavender text-app-text font-bold text-xl hover:bg-lavender/70 transition">-</button>
              <span className="text-3xl font-bold text-app-text w-12 text-center">{points}</span>
              <button type="button" onClick={() => setPoints(points + 1)}
                className="w-10 h-10 rounded-full bg-secondary text-app-text font-bold text-xl hover:bg-secondary/70 transition">+</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-app-text mb-1">{t('noteOptional')}</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={t('notePlaceholder')}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-lavender text-app-text font-semibold hover:bg-lavender/20 transition">
              {t('cancel')}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-primary text-white font-bold shadow hover:bg-primary/80 transition disabled:opacity-50">
              {loading ? '⏳' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
