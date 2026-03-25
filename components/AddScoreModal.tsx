'use client'

import { useRef, useState } from 'react'
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
  const [step, setStep] = useState<'form' | 'pin'>('form')
  const [date, setDate] = useState(today)
  const [points, setPoints] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // PIN step
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState('')
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser.passcode) {
      setStep('pin')
    } else {
      submitScore()
    }
  }

  const submitScore = async () => {
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

  const handlePinInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...pin]
    next[i] = val
    setPin(next)
    setPinError('')
    if (val && i < 3) pinRefs[i + 1].current?.focus()
  }

  const handlePinKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[i] && i > 0) {
      pinRefs[i - 1].current?.focus()
    }
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const entered = pin.join('')
    if (entered.length < 4) { setPinError(t('passcodeInvalid')); return }
    if (entered !== currentUser.passcode) {
      setPinError(t('wrongPasscode'))
      setPin(['', '', '', ''])
      pinRefs[0].current?.focus()
      return
    }
    submitScore()
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

        {step === 'form' ? (
          <form onSubmit={handleFormSubmit} className="space-y-4">
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

            {!currentUser.passcode && (
              <p className="text-amber-500 text-xs">{t('noPasscodeWarning')}</p>
            )}
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
        ) : (
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🔐</div>
              <p className="font-semibold text-app-text">{t('enterPasscode')}</p>
              <p className="text-app-text/50 text-sm mt-1">{t('enterPasscodeHint')}</p>
            </div>

            <div className="flex justify-center gap-3">
              {pin.map((d, i) => (
                <input
                  key={i}
                  ref={pinRefs[i]}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handlePinInput(i, e.target.value)}
                  onKeyDown={e => handlePinKeyDown(i, e)}
                  autoFocus={i === 0}
                  className="w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text"
                />
              ))}
            </div>

            {pinError && <p className="text-red-500 text-sm text-center">{pinError}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep('form'); setPin(['', '', '', '']); setPinError('') }}
                className="flex-1 py-3 rounded-2xl border-2 border-lavender text-app-text font-semibold hover:bg-lavender/20 transition">
                {t('cancel')}
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-primary text-white font-bold shadow hover:bg-primary/80 transition disabled:opacity-50">
                {loading ? '⏳' : t('save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
