'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import BunnySVG from './BunnySVG'
import { useLanguage } from '@/contexts/LanguageContext'
import type { User } from '@/lib/types'

const BUNNY_COLORS = [
  '#FFB7C5', '#B5EAD7', '#FFDAC1', '#C7CEEA',
  '#FF9AA2', '#FFEAA7', '#A8E6CF', '#DCD3FF',
  '#FFD3B6', '#B5D8F7', '#F0C4F0', '#C8F7C5',
]

interface AddChildModalProps {
  currentUser: User
  onClose: () => void
  onSuccess: () => void
}

/** Generates a public_id from the child's name: alphanumeric chars + 4 random digits. */
function makePublicId(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9]/g, '') || 'bunny'
  const digits = String(Math.floor(1000 + Math.random() * 9000))
  return base + digits
}

export default function AddChildModal({ currentUser, onClose, onSuccess }: AddChildModalProps) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [bunnyColor, setBunnyColor] = useState(BUNNY_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    const supabase = createClient()

    // Check name uniqueness within this owner's bunnies
    const { data: existing } = await supabase
      .from('children')
      .select('id')
      .eq('created_by', currentUser.id)
      .ilike('name', trimmed)

    if (existing && existing.length > 0) {
      setError(`You already have a bunny named "${trimmed}". Please choose a different name.`)
      setLoading(false)
      return
    }

    // Generate a unique public_id (retry up to 5 times on collision)
    let publicId = ''
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = makePublicId(trimmed)
      const { data: clash } = await supabase
        .from('children')
        .select('id')
        .eq('public_id', candidate)
        .maybeSingle()
      if (!clash) { publicId = candidate; break }
    }

    if (!publicId) {
      setError('Could not generate a unique ID. Please try again.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('children').insert({
      name: trimmed,
      bunny_color: bunnyColor,
      public_id: publicId,
      created_by: currentUser.id,
    })

    if (error) setError(error.message)
    else { onSuccess(); onClose() }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl border-2 border-primary/30 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-app-text">{t('addNewBunny')}</h2>
          <button onClick={onClose} className="text-app-text/50 hover:text-app-text">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-app-text mb-1">{t('childName')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder={t('childNamePlaceholder')}
              className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-app-text mb-2">{t('bunnyColor')}</label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {BUNNY_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBunnyColor(color)}
                  className={`w-10 h-10 rounded-full border-4 transition ${bunnyColor === color ? 'border-app-text scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex justify-center">
              <BunnySVG color={bunnyColor} size={90} />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-lavender text-app-text font-semibold hover:bg-lavender/20 transition">
              {t('cancel')}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-primary text-white font-bold shadow hover:bg-primary/80 transition disabled:opacity-50">
              {loading ? '⏳' : t('addBunnyBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
