'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LandingPage() {
  const router = useRouter()
  const { lang, setLang } = useLanguage()
  const [bunnyId, setBunnyId] = useState('')
  const [error, setError] = useState('')

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    const id = bunnyId.trim()
    if (!id) { setError('Please enter a Bunny ID.'); return }
    router.push(`/bunny/${id}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          className="px-3 py-1.5 rounded-xl bg-white text-app-text font-bold text-sm hover:bg-lemon transition border-2 border-lavender shadow"
        >
          {lang === 'en' ? '中文' : 'EN'}
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🐰</div>
          <h1 className="text-4xl font-bold text-app-text mb-2">
            {lang === 'en' ? 'Good Kid Score App' : '乖寶寶記分'}
          </h1>
          <p className="text-app-text/60 text-lg">
            {lang === 'en' ? 'Earn Carrots, Grow Happy! 🥕' : '累積胡蘿蔔，快樂成長！🥕'}
          </p>
        </div>

        {/* Bunny ID lookup card */}
        <div className="w-full max-w-md bg-white rounded-3xl border-2 border-primary/30 shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-app-text mb-1 text-center">
            {lang === 'en' ? '🔍 View a Bunny Profile' : '🔍 查看兔兔紀錄'}
          </h2>
          <p className="text-app-text/50 text-sm text-center mb-5">
            {lang === 'en'
              ? 'Enter your Bunny ID'
              : '輸入你的兔兔 ID'}
          </p>
          <form onSubmit={handleLookup} className="space-y-3">
            <input
              type="text"
              value={bunnyId}
              onChange={e => { setBunnyId(e.target.value); setError('') }}
              placeholder={lang === 'en' ? 'e.g. Isabella5566' : '例：Isabella5566'}
              className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text font-mono tracking-wide"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white font-bold text-lg shadow hover:bg-primary/80 transition"
            >
              <Search size={20} />
              {lang === 'en' ? 'View Profile' : '查看紀錄'}
            </button>
          </form>
        </div>

        {/* Parent entry point */}
        <div className="w-full max-w-md">
          <Link
            href="/dashboard"
            className="block w-full py-3 rounded-2xl bg-secondary text-app-text font-bold text-center hover:bg-secondary/70 transition shadow"
          >
            {lang === 'en' ? '🐰 Open Dashboard' : '🐰 開啟管理頁面'}
          </Link>
        </div>
      </main>

      <footer className="text-center pb-6 text-app-text/30 text-sm">
        🥕 {lang === 'en' ? 'Track good behavior with carrot points' : '用胡蘿蔔點數記錄好行為'}
      </footer>
    </div>
  )
}
