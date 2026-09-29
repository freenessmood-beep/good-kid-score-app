'use client'

import Navbar from '@/components/Navbar'
import RewardsTable from '@/components/RewardsTable'
import EarningRulesTable from '@/components/EarningRulesTable'
import ExportRewardsTable from '@/components/ExportRewardsTable'
import { useLanguage } from '@/contexts/LanguageContext'
import { useStore } from '@/lib/store'

export default function RewardsPage() {
  const { t } = useLanguage()
  const { doc, loading } = useStore()

  const rewards = [...doc.reward_items].sort((a, b) => a.carrot_threshold - b.carrot_threshold)
  const earningRules = [...doc.earning_rules].sort((a, b) => a.carrots - b.carrots)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-6xl animate-bounce">🎁</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Export button */}
        <div className="flex justify-center">
          <ExportRewardsTable rewards={rewards} earningRules={earningRules} />
        </div>

        {/* How to Earn Carrots */}
        <div>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🥕</div>
            <h1 className="text-3xl font-bold text-app-text">{t('earningRulesTitle')}</h1>
            <p className="text-app-text/60 mt-1">{t('earningRulesSubtitle')}</p>
          </div>
          <div className="bg-white rounded-3xl border-2 border-primary/20 p-6">
            <EarningRulesTable rules={earningRules} />
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
            <RewardsTable rewards={rewards} />
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
