'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Child, EarningRule, User } from '@/lib/types'

interface AddScoreModalProps {
  child: Child
  currentUser: User
  onClose: () => void
  onSuccess: () => void
  currentMonthEarned?: number
}

export default function AddScoreModal({ child, currentUser, onClose, onSuccess, currentMonthEarned = 0 }: AddScoreModalProps) {
  const { t } = useLanguage()
  const today = new Date().toISOString().split('T')[0]
  const [step, setStep] = useState<'form' | 'pin'>('form')
  const [date, setDate] = useState(today)
  const [selectedRule, setSelectedRule] = useState<EarningRule | null>(null)
  const [note, setNote] = useState('')
  const [rules, setRules] = useState<EarningRule[]>([])
  const [rulesLoading, setRulesLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const points = selectedRule?.carrots ?? 0
  const cap = currentUser.max_carrots_cap
  const wouldExceedCap = cap && cap > 0 && (currentMonthEarned + points) > cap

  // PIN step
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState('')
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    const fetchRules = async () => {
      const supabase = createClient()
      const effectiveOwnerId = currentUser.main_admin_id || currentUser.id
      const { data } = await supabase
        .from('earning_rules')
        .select('*')
        .eq('created_by', effectiveOwnerId)
        .order('carrots')
      setRules(data || [])
      setRulesLoading(false)
    }
    fetchRules()
  }, [currentUser.id, currentUser.main_admin_id])

  const handleRuleSelect = (rule: EarningRule) => {
    setSelectedRule(rule)
    if (!note) setNote(rule.description)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRule) return
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
              <label className="block text-sm font-semibold text-app-text mb-2">{t('selectEarningRule')}</label>
              {rulesLoading ? (
                <p className="text-app-text/40 text-sm py-4 text-center">⏳</p>
              ) : rules.length === 0 ? (
                <p className="text-amber-500 text-sm py-2">{t('noRulesForScore')}</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {rules.map(rule => (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => handleRuleSelect(rule)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition
                        ${selectedRule?.id === rule.id
                          ? 'border-primary bg-primary/10'
                          : 'border-lavender hover:border-primary/50 bg-lemon/20'
                        }`}
                    >
                      <span className="bg-secondary/50 rounded-xl px-2.5 py-1 font-bold text-app-text text-sm whitespace-nowrap">
                        +{rule.carrots} 🥕
                      </span>
                      <span className="font-semibold text-app-text text-sm">{rule.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedRule && (
              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">{t('noteOptional')}</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={t('notePlaceholder')}
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text resize-none"
                />
              </div>
            )}

            {wouldExceedCap && (
              <p className="text-amber-500 text-xs">
                ⚠️ {t('maxCapWarning')} 🥕{cap}. {t('available')}: 🥕{Math.max(0, cap! - currentMonthEarned)}
              </p>
            )}
            {!currentUser.passcode && (
              <p className="text-amber-500 text-xs">{t('noPasscodeWarning')}</p>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-2xl border-2 border-lavender text-app-text font-semibold hover:bg-lavender/20 transition">
                {t('cancel')}
              </button>
              <button type="submit" disabled={loading || !selectedRule || rules.length === 0}
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
