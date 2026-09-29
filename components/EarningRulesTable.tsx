'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useStore } from '@/lib/store'
import type { EarningRule } from '@/lib/types'

interface EarningRulesTableProps {
  rules: EarningRule[]
}

export default function EarningRulesTable({ rules }: EarningRulesTableProps) {
  const { t } = useLanguage()
  const { insert, update, remove } = useStore()
  const isOwner = true
  const [adding, setAdding] = useState(false)
  const [newCarrots, setNewCarrots] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editCarrots, setEditCarrots] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const handleAdd = () => {
    if (!newCarrots || !newDesc) return
    insert('earning_rules', {
      carrots: parseInt(newCarrots),
      description: newDesc,
    })
    setNewCarrots(''); setNewDesc(''); setAdding(false)
  }

  const handleDelete = (id: string) => {
    remove('earning_rules', id)
  }

  const handleEdit = (rule: EarningRule) => {
    setEditId(rule.id)
    setEditCarrots(rule.carrots.toString())
    setEditDesc(rule.description)
  }

  const handleEditSave = () => {
    if (!editId) return
    update('earning_rules', editId, {
      carrots: parseInt(editCarrots),
      description: editDesc,
    })
    setEditId(null)
  }

  const sorted = [...rules].sort((a, b) => a.carrots - b.carrots)

  return (
    <div className="space-y-3">
      {sorted.map(rule => (
        <div key={rule.id} className="bg-white rounded-2xl border-2 border-secondary/60 px-4 py-3 flex items-center gap-3">
          {editId === rule.id ? (
            <>
              <input
                type="number"
                value={editCarrots}
                onChange={e => setEditCarrots(e.target.value)}
                className="w-20 px-2 py-1 rounded-xl border-2 border-lavender outline-none text-center text-app-text"
                min="1"
              />
              <span className="text-app-text">🥕</span>
              <input
                type="text"
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="flex-1 px-2 py-1 rounded-xl border-2 border-lavender outline-none text-app-text"
              />
              <button onClick={handleEditSave} className="text-green-500 hover:text-green-700"><Check size={18} /></button>
              <button onClick={() => setEditId(null)} className="text-app-text/40 hover:text-app-text"><X size={18} /></button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 bg-secondary/40 rounded-xl px-3 py-1">
                <span className="text-xl font-bold text-app-text">+{rule.carrots}</span>
                <span>🥕</span>
              </div>
              <span className="flex-1 font-semibold text-app-text">{rule.description}</span>
              {isOwner && (
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(rule)} className="p-1.5 rounded-xl hover:bg-lavender/30 text-app-text/50 hover:text-app-text transition">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-app-text/50 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {isOwner && (
        adding ? (
          <div className="bg-white rounded-2xl border-2 border-primary/30 px-4 py-3 flex items-center gap-3">
            <input
              type="number"
              value={newCarrots}
              onChange={e => setNewCarrots(e.target.value)}
              placeholder="5"
              className="w-20 px-2 py-1 rounded-xl border-2 border-lavender outline-none text-center text-app-text"
              min="1"
            />
            <span className="text-app-text">🥕</span>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="e.g. Do homework"
              className="flex-1 px-2 py-1 rounded-xl border-2 border-lavender outline-none text-app-text"
            />
            <button onClick={handleAdd} className="text-green-500 hover:text-green-700"><Check size={18} /></button>
            <button onClick={() => setAdding(false)} className="text-app-text/40 hover:text-app-text"><X size={18} /></button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-app-text/60 hover:text-primary font-semibold w-full px-4 py-3 rounded-2xl border-2 border-dashed border-lavender hover:border-primary transition"
          >
            <Plus size={18} />
            {t('addEarningRule')}
          </button>
        )
      )}

      {rules.length === 0 && !adding && (
        <p className="text-center text-app-text/50 py-8">
          {t('noEarningRulesYet')} {isOwner ? t('noEarningRulesOwner') : t('noEarningRulesViewer')}
        </p>
      )}
    </div>
  )
}
