'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import type { RewardItem, User } from '@/lib/types'

interface RewardsTableProps {
  rewards: RewardItem[]
  currentUser: User | null
  onRefresh: () => void
}

export default function RewardsTable({ rewards, currentUser, onRefresh }: RewardsTableProps) {
  const { t } = useLanguage()
  const isOwner = currentUser?.role === 'owner'
  const [adding, setAdding] = useState(false)
  const [newThreshold, setNewThreshold] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editThreshold, setEditThreshold] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const supabase = createClient()

  const handleAdd = async () => {
    if (!newThreshold || !newDesc || !currentUser) return
    await supabase.from('reward_items').insert({
      carrot_threshold: parseInt(newThreshold),
      reward_description: newDesc,
      created_by: currentUser.id
    })
    setNewThreshold(''); setNewDesc(''); setAdding(false)
    onRefresh()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('reward_items').delete().eq('id', id)
    onRefresh()
  }

  const handleEdit = (reward: RewardItem) => {
    setEditId(reward.id)
    setEditThreshold(reward.carrot_threshold.toString())
    setEditDesc(reward.reward_description)
  }

  const handleEditSave = async () => {
    if (!editId) return
    await supabase.from('reward_items').update({
      carrot_threshold: parseInt(editThreshold),
      reward_description: editDesc
    }).eq('id', editId)
    setEditId(null)
    onRefresh()
  }

  const sorted = [...rewards].sort((a, b) => a.carrot_threshold - b.carrot_threshold)

  return (
    <div className="space-y-3">
      {sorted.map(reward => (
        <div key={reward.id} className="bg-white rounded-2xl border-2 border-lavender px-4 py-3 flex items-center gap-3">
          {editId === reward.id ? (
            <>
              <input
                type="number"
                value={editThreshold}
                onChange={e => setEditThreshold(e.target.value)}
                className="w-20 px-2 py-1 rounded-xl border-2 border-lavender outline-none text-center text-app-text"
                min="1"
              />
              <span className="text-app-text">🥕 =</span>
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
              <div className="flex items-center gap-1 bg-lemon rounded-xl px-3 py-1">
                <span className="text-xl font-bold text-app-text">{reward.carrot_threshold}</span>
                <span>🥕</span>
              </div>
              <span className="text-app-text/50">=</span>
              <span className="flex-1 font-semibold text-app-text">{reward.reward_description}</span>
              {isOwner && (
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(reward)} className="p-1.5 rounded-xl hover:bg-lavender/30 text-app-text/50 hover:text-app-text transition">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(reward.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-app-text/50 hover:text-red-500 transition">
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
              value={newThreshold}
              onChange={e => setNewThreshold(e.target.value)}
              placeholder="10"
              className="w-20 px-2 py-1 rounded-xl border-2 border-lavender outline-none text-center text-app-text"
              min="1"
            />
            <span className="text-app-text">🥕 =</span>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="e.g. Extra screen time"
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
            {t('addReward')}
          </button>
        )
      )}

      {rewards.length === 0 && !adding && (
        <p className="text-center text-app-text/50 py-8">
          {t('noRewardsYet')} {isOwner ? t('noRewardsOwner') : t('noRewardsViewer')}
        </p>
      )}
    </div>
  )
}
