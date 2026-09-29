'use client'

import { useState } from 'react'
import { ExternalLink, Github, Lock } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useStore } from '@/lib/store'

const TOKEN_PAGE = 'https://github.com/settings/personal-access-tokens/new'

/**
 * Shown on a device that has no token yet. GitHub Pages cannot keep a secret,
 * so the token is supplied here and stays in this browser's storage.
 */
export default function TokenSetup() {
  const { lang, setLang, t } = useLanguage()
  const { connect, repo: defaultRepo } = useStore()

  const [token, setTokenInput] = useState('')
  const [repo, setRepoInput] = useState(defaultRepo)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!token.trim()) { setError(t('setupNeedToken')); return }
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo.trim())) { setError(t('setupNeedRepo')); return }

    setChecking(true)
    try {
      await connect(token, repo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect.')
    } finally {
      setChecking(false)
    }
  }

  const steps = [t('setupStep1'), t('setupStep2'), t('setupStep3'), t('setupStep4')]

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          className="px-3 py-1.5 rounded-xl bg-white text-app-text font-bold text-sm hover:bg-lemon transition border-2 border-lavender shadow"
        >
          {lang === 'en' ? '中文' : 'EN'}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🐰</div>
          <h1 className="text-3xl font-bold text-app-text">{t('appName')}</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-7 border-2 border-primary/30">
          <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-app-text mb-2">
            <Github size={20} /> {t('setupTitle')}
          </h2>
          <p className="text-app-text/60 text-sm text-center mb-5">{t('setupIntro')}</p>

          <ol className="space-y-2 mb-5">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-app-text/70">
                <span className="shrink-0 w-5 h-5 rounded-full bg-lavender text-app-text font-bold text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <a
            href={TOKEN_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 mb-5 rounded-2xl bg-lemon text-app-text font-semibold text-sm border-2 border-lavender hover:bg-lemon/70 transition"
          >
            <ExternalLink size={15} /> {t('setupCreateToken')}
          </a>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-app-text mb-1">{t('setupTokenLabel')}</label>
              <input
                type="password"
                value={token}
                onChange={e => { setTokenInput(e.target.value); setError('') }}
                placeholder="github_pat_…"
                autoComplete="off"
                spellCheck={false}
                className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-app-text mb-1">{t('setupRepoLabel')}</label>
              <input
                type="text"
                value={repo}
                onChange={e => { setRepoInput(e.target.value); setError('') }}
                placeholder="your-name/good-kid-score-data"
                spellCheck={false}
                className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none bg-lemon/30 text-app-text font-mono text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 text-red-600 text-sm break-words">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={checking}
              className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-lg shadow-md hover:bg-primary/80 transition disabled:opacity-50"
            >
              {checking ? t('setupChecking') : '🔗 ' + t('setupConnect')}
            </button>
          </form>

          <p className="flex items-start gap-1.5 text-app-text/45 text-xs mt-5">
            <Lock size={13} className="shrink-0 mt-0.5" />
            {t('setupPrivacy')}
          </p>
        </div>
      </div>
    </div>
  )
}
