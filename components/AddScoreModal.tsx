'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useStore } from '@/lib/store'
import type { Child, EarningRule } from '@/lib/types'

interface AddScoreModalProps {
  child: Child
  onClose: () => void
}

export default function AddScoreModal({ child, onClose }: AddScoreModalProps) {
  const { t } = useLanguage()
  const { doc, insert } = useStore()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [selectedRule, setSelectedRule] = useState<EarningRule | null>(null)
  const [note, setNote] = useState('')
  const rules = [...doc.earning_rules].sort((a, b) => a.carrots - b.carrots)

  const handleRuleSelect = (rule: EarningRule) => {
    setSelectedRule(rule)
    if (!note) setNote(rule.description)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRule) return
    insert('score_entries', {
      child_id: child.id,
      date,
      points: selectedRule.carrots,
      note: note || null,
    })
    onClose()
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
            <label className="block text-sm font-semibold text-app-text mb-2">{t('selectEarningRule')}</label>
            {rules.length === 0 ? (
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

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-lavender text-app-text font-semibold hover:bg-lavender/20 transition">
              {t('cancel')}
            </button>
            <button type="submit" disabled={!selectedRule || rules.length === 0}
              className="flex-1 py-3 rounded-2xl bg-primary text-white font-bold shadow hover:bg-primary/80 transition disabled:opacity-50">
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
