'use client'

import { useRef } from 'react'
import { Download } from 'lucide-react'
import Navbar from '@/components/Navbar'
import BunnySVG from '@/components/BunnySVG'
import { useLanguage } from '@/contexts/LanguageContext'
import { useStore } from '@/lib/store'
import { getAvailableCarrots } from '@/lib/balance'
import type { Child } from '@/lib/types'

interface RankedChild {
  child: Child
  availableCarrots: number
  rank: number
}

const RANK_STYLES: Record<number, { badge: string; bg: string; border: string }> = {
  1: { badge: '🥇', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  2: { badge: '🥈', bg: 'bg-gray-50', border: 'border-gray-300' },
  3: { badge: '🥉', bg: 'bg-orange-50', border: 'border-orange-300' },
}

export default function LeaderboardPage() {
  const { t } = useLanguage()
  const { doc, loading } = useStore()
  const reportRef = useRef<HTMLDivElement>(null)

  const ranked: RankedChild[] = [...doc.children]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(child => ({
      child,
      availableCarrots: getAvailableCarrots(child.id, doc.score_entries, doc.trades),
    }))
    .sort((a, b) => b.availableCarrots - a.availableCarrots)
    .map((item, idx) => ({ ...item, rank: idx + 1 }))

  const handleExport = async () => {
    if (!reportRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFF9FB',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfPageHeight = pdf.internal.pageSize.getHeight()
    const imgHeight = (canvas.height * pdfWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
    heightLeft -= pdfPageHeight

    while (heightLeft > 0) {
      position -= pdfPageHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
      heightLeft -= pdfPageHeight
    }

    pdf.save(`leaderboard-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-6xl animate-bounce">🏆</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-3xl font-bold text-app-text">{t('leaderboardTitle')}</h1>
          <p className="text-app-text/60 mt-1">{t('leaderboardSubtitle')}</p>
        </div>

        {ranked.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-accent text-app-text font-bold px-4 py-2 rounded-2xl hover:bg-accent/70 transition shadow"
            >
              <Download size={18} />
              Export PDF
            </button>
          </div>
        )}

        {ranked.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-app-text/50 text-lg">{t('noBunniesYet')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ranked.map(({ child, availableCarrots, rank }) => {
              const style = RANK_STYLES[rank] ?? { badge: `#${rank}`, bg: 'bg-white', border: 'border-lavender' }
              return (
                <div
                  key={child.id}
                  className={`rounded-3xl border-2 px-5 py-4 flex items-center gap-4 ${style.bg} ${style.border}`}
                >
                  {/* Rank */}
                  <div className="w-10 text-center">
                    {rank <= 3 ? (
                      <span className="text-3xl">{style.badge}</span>
                    ) : (
                      <span className="text-xl font-bold text-app-text/50">#{rank}</span>
                    )}
                  </div>

                  {/* Bunny */}
                  <BunnySVG color={child.bunny_color} size={56} />

                  {/* Name */}
                  <div className="flex-1">
                    <p className="text-xl font-bold text-app-text">{child.name}</p>
                    <p className="text-app-text/50 text-sm">{t('rank')} #{rank}</p>
                  </div>

                  {/* Carrot count */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-app-text">🥕 {availableCarrots}</p>
                    <p className="text-xs text-app-text/40">{t('availableTotal')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Hidden PDF report */}
      <div className="fixed -left-[9999px] top-0">
        <div
          ref={reportRef}
          className="w-[620px] p-10 bg-background"
          style={{ fontFamily: "'Microsoft JhengHei', 'Baloo 2', cursive" }}
        >
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🏆 Good Kid Score App 🥕</div>
            <h1 className="text-3xl font-bold text-app-text">Leaderboard</h1>
            <p className="text-app-text/60 text-lg">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          <div className="space-y-3">
            {ranked.map(({ child, availableCarrots, rank }) => {
              const style = RANK_STYLES[rank] ?? { badge: `#${rank}`, bg: 'bg-white', border: 'border-lavender' }
              return (
                <div
                  key={child.id}
                  className={`rounded-3xl border-2 px-5 py-4 flex items-center gap-4 ${style.bg} ${style.border}`}
                >
                  <div className="w-10 text-center">
                    {rank <= 3 ? (
                      <span className="text-3xl">{style.badge}</span>
                    ) : (
                      <span className="text-xl font-bold text-app-text/50">#{rank}</span>
                    )}
                  </div>
                  <BunnySVG color={child.bunny_color} size={56} />
                  <div className="flex-1">
                    <p className="text-xl font-bold text-app-text">{child.name}</p>
                    <p className="text-app-text/50 text-sm">Rank #{rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-app-text">🥕 {availableCarrots}</p>
                    <p className="text-xs text-app-text/40">available</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-8 text-app-text/40 text-sm">
            Generated by Good Kid Score App
          </div>
        </div>
      </div>
    </div>
  )
}
