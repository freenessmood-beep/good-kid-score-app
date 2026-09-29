'use client'

import Link from 'next/link'
import { Gift, Home, ShoppingCart, Trophy } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import SyncIndicator from './SyncIndicator'

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()

  return (
    <nav className="bg-white border-b-2 border-primary/20 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🐰</span>
          <span className="font-bold text-app-text text-lg leading-none block">{t('appName')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-background transition text-app-text/70 hover:text-app-text">
            <Home size={20} />
          </Link>
          <Link href="/rewards" className="p-2 rounded-xl hover:bg-background transition text-app-text/70 hover:text-app-text">
            <Gift size={20} />
          </Link>
          <Link href="/trades" className="p-2 rounded-xl hover:bg-background transition text-app-text/70 hover:text-app-text">
            <ShoppingCart size={20} />
          </Link>
          <Link href="/leaderboard" className="p-2 rounded-xl hover:bg-background transition text-app-text/70 hover:text-app-text">
            <Trophy size={20} />
          </Link>
          <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="px-3 py-1.5 rounded-xl bg-lemon text-app-text font-bold text-sm hover:bg-lemon/70 transition border-2 border-lavender"
          >
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          <div className="ml-1">
            <SyncIndicator />
          </div>
        </div>
      </div>
    </nav>
  )
}
