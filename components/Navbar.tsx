'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gift, LogOut, Home, ShoppingCart, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { User } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'

interface NavbarProps {
  currentUser: User | null
}

export default function Navbar({ currentUser }: NavbarProps) {
  const router = useRouter()
  const { lang, setLang, t } = useLanguage()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

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
          {currentUser && (
            <div className="flex items-center gap-2 ml-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: currentUser.avatar_color }}
              >
                {currentUser.name[0]?.toUpperCase()}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl hover:bg-red-50 transition text-app-text/70 hover:text-red-500"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
