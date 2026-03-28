'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Send } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const subject = encodeURIComponent(`[Bunny Adventure] ${title}`)
    const body = encodeURIComponent(description || '(no description provided)')
    window.open(`mailto:freenessmood@gmail.com?subject=${subject}&body=${body}`)
    setTitle('')
    setDescription('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <footer className="bg-white border-t-2 border-primary/10 mt-4">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 text-app-text/40 hover:text-app-text/70 text-xs transition"
        >
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {t('reportIssue')}
        </button>

        {open && (
          <form onSubmit={handleSubmit} className="mt-3 space-y-2 max-w-md">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('issueTitle')}
              required
              className="w-full px-3 py-2 rounded-xl border-2 border-lavender focus:border-primary outline-none text-sm text-app-text bg-lemon/20"
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('issueDescription')}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border-2 border-lavender focus:border-primary outline-none text-sm text-app-text resize-none bg-lemon/20"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-lavender text-app-text font-semibold text-sm hover:bg-lavender/70 transition"
            >
              <Send size={13} />
              {submitted ? t('issueSubmitted') : t('submitIssue')}
            </button>
          </form>
        )}
      </div>
    </footer>
  )
}
