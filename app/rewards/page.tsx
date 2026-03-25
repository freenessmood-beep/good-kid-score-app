'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import RewardsTable from '@/components/RewardsTable'
import EarningRulesTable from '@/components/EarningRulesTable'
import ExportRewardsTable from '@/components/ExportRewardsTable'
import { useLanguage } from '@/contexts/LanguageContext'
import type { EarningRule, RewardItem, User } from '@/lib/types'

export default function RewardsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [earningRules, setEarningRules] = useState<EarningRule[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = async () => {
    const user = await getCurrentUser()
    if (!user) { router.push('/login'); return }
    setCurrentUser(user)

    const [{ data: rewardsData }, { data: rulesData }] = await Promise.all([
      supabase.from('reward_items').select('*').order('carrot_threshold'),
      supabase.from('earning_rules').select('*').order('carrots'),
    ])
    setRewards(rewardsData || [])
    setEarningRules(rulesData || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-6xl animate-bounce">🎁</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentUser={currentUser} />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Page header with export button */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-app-text">🎁 {t('rewardsTitle')}</h1>
          <p className="text-app-text/60 mt-1 mb-4">{t('rewardsSubtitle')}</p>
          <div className="flex justify-center">
            <ExportRewardsTable rewards={rewards} earningRules={earningRules} />
          </div>
        </div>

        {/* How to Earn Carrots */}
        <div>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🥕</div>
            <h1 className="text-3xl font-bold text-app-text">{t('earningRulesTitle')}</h1>
            <p className="text-app-text/60 mt-1">{t('earningRulesSubtitle')}</p>
          </div>
          <div className="bg-white rounded-3xl border-2 border-primary/20 p-6">
            <EarningRulesTable rules={earningRules} currentUser={currentUser} onRefresh={fetchData} />
          </div>
        </div>

        {/* Rewards Table */}
        <div>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎁</div>
            <h1 className="text-3xl font-bold text-app-text">{t('rewardsTitle')}</h1>
            <p className="text-app-text/60 mt-1">{t('rewardsSubtitle')}</p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-primary/20 p-6">
            <RewardsTable rewards={rewards} currentUser={currentUser} onRefresh={fetchData} />
          </div>

          <div className="mt-6 bg-lemon/50 rounded-3xl border-2 border-lemon p-5 text-center">
            <p className="text-app-text/70 font-semibold">
              {t('rewardsMotivation')}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
