'use client'

import { useRef } from 'react'
import { Download } from 'lucide-react'
import BunnySVG from './BunnySVG'
import type { Child, ScoreEntry, Trade, RewardItem } from '@/lib/types'

interface ExportAllReportProps {
  children: Child[]
  entries: ScoreEntry[]
  trades: Trade[]
  rewards: RewardItem[]
  month: string // "YYYY-MM"
}

export default function ExportAllReport({ children, entries, trades, rewards, month }: ExportAllReportProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  const monthDate = new Date(month + '-01')
  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const handleExport = async () => {
    if (!reportRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFF9FB'
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

    pdf.save(`all-kids-${month}-report.pdf`)
  }

  return (
    <div>
      <button
        onClick={handleExport}
        className="flex items-center gap-2 bg-accent text-app-text font-bold px-4 py-2 rounded-2xl hover:bg-accent/70 transition shadow"
      >
        <Download size={18} />
        Export All PDF
      </button>

      <div className="fixed -left-[9999px] top-0">
        <div
          ref={reportRef}
          className="w-[620px] p-10 bg-background"
          style={{ fontFamily: "'Microsoft JhengHei', 'Baloo 2', cursive" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🐰 Good Kid Score App 🥕</div>
            <h1 className="text-3xl font-bold text-app-text">Monthly Summary</h1>
            <p className="text-app-text/60 text-lg">{monthLabel}</p>
          </div>

          {/* Each child */}
          {children.map(child => {
            const childEntries = entries.filter(e => e.child_id === child.id && e.date.startsWith(month))
            const childTrades = trades.filter(t => t.child_id === child.id && t.date.startsWith(month))
            const totalEarned = childEntries.reduce((sum, e) => sum + e.points, 0)
            const totalSpent = childTrades.reduce((sum, t) => sum + t.carrots_spent, 0)
            const available = totalEarned - totalSpent
            const earnedRewards = rewards.filter(r => r.carrot_threshold <= totalEarned)

            return (
              <div key={child.id} className="mb-8 bg-white rounded-3xl border-2 border-primary/20 p-5">
                {/* Child header */}
                <div className="flex items-center gap-4 mb-4">
                  <BunnySVG color={child.bunny_color} size={70} />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-app-text">{child.name}</h2>
                    <div className="flex gap-4 mt-1 text-sm">
                      <span className="text-app-text/70">Earned: <strong>🥕 {totalEarned}</strong></span>
                      <span className="text-app-text/70">Spent: <strong>🥕 {totalSpent}</strong></span>
                      <span className="text-app-text/70">Available: <strong>🥕 {available}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Score entries */}
                {childEntries.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-bold text-app-text mb-1">Score Entries</p>
                    {childEntries.sort((a, b) => a.date.localeCompare(b.date)).map(entry => (
                      <div key={entry.id} className="flex justify-between text-sm py-1 border-b border-lavender/40">
                        <span className="text-app-text/70">{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{entry.note ? ` — ${entry.note}` : ''}</span>
                        <span className="font-semibold text-app-text">🥕 ×{entry.points}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Trades */}
                {childTrades.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-bold text-app-text mb-1">Trades / Redemptions</p>
                    {childTrades.sort((a, b) => a.date.localeCompare(b.date)).map(trade => (
                      <div key={trade.id} className="flex justify-between text-sm py-1 border-b border-lavender/40">
                        <span className="text-app-text/70">{new Date(trade.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {trade.reward_description}</span>
                        <span className="font-semibold text-red-400">-🥕 {trade.carrots_spent}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rewards earned */}
                {earnedRewards.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-bold text-app-text mb-1">🎉 Rewards Reached</p>
                    {earnedRewards.map(r => (
                      <span key={r.id} className="inline-block bg-secondary/40 rounded-xl px-2 py-0.5 text-xs text-app-text mr-1 mb-1">🏆 {r.reward_description}</span>
                    ))}
                  </div>
                )}

                {childEntries.length === 0 && childTrades.length === 0 && (
                  <p className="text-app-text/40 text-sm text-center py-2">No activity this month</p>
                )}
              </div>
            )
          })}

          <div className="text-center mt-4 text-app-text/40 text-sm">
            Generated by Good Kid Score App
          </div>
        </div>
      </div>
    </div>
  )
}
