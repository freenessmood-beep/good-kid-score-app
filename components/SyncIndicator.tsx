'use client'

import { Check, CloudOff, Loader2, RefreshCw } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Data lives in a GitHub repo, so saves are not instant. This shows whether the
 * current state has actually reached GitHub, and lets a failed save be retried.
 */
export default function SyncIndicator() {
  const { sync, syncError, retry } = useStore()
  const { t } = useLanguage()

  if (sync === 'idle' || sync === 'loading') {
    return (
      <span className="hidden sm:flex items-center gap-1 text-app-text/35 text-xs" title={t('syncSaved')}>
        <Check size={13} />
      </span>
    )
  }

  if (sync === 'saving') {
    return (
      <span className="flex items-center gap-1 text-app-text/50 text-xs">
        <Loader2 size={13} className="animate-spin" />
        <span className="hidden sm:inline">{t('syncSaving')}</span>
      </span>
    )
  }

  if (sync === 'pending') {
    return (
      <span className="flex items-center gap-1 text-app-text/50 text-xs">
        <span className="w-2 h-2 rounded-full bg-secondary" />
        <span className="hidden sm:inline">{t('syncPending')}</span>
      </span>
    )
  }

  return (
    <button
      onClick={retry}
      title={syncError ?? t('syncFailed')}
      className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs font-semibold"
    >
      <CloudOff size={13} />
      <span className="hidden sm:inline">{t('syncFailed')}</span>
      <RefreshCw size={12} />
    </button>
  )
}
