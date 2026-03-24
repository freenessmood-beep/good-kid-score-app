'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const router = useRouter()
  const { lang, setLang, t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (isSignUp) {
      let role = 'owner'

      // If an invite code was provided, validate it
      if (inviteCode.trim()) {
        const { data: invitation } = await supabase
          .from('invitations')
          .select('*')
          .eq('code', inviteCode.trim().toUpperCase())
          .eq('used', false)
          .single()

        if (!invitation) {
          setError('Invalid or already used invitation code.')
          setLoading(false)
          return
        }

        role = 'viewer'

        // Mark the invitation as used
        await supabase
          .from('invitations')
          .update({ used: true, used_by_email: email })
          .eq('id', invitation.id)

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role } }
        })
        if (signUpError) { setError(signUpError.message); setLoading(false); return }

        router.push('/')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role }
        }
      })
      if (error) setError(error.message)
      else router.push('/')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }
    setLoading(false)
  }

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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐰</div>
          <h1 className="text-3xl font-bold text-app-text">{t('appName')}</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-primary/30">
          <h2 className="text-xl font-bold text-app-text mb-6 text-center">
            {isSignUp ? t('createAccount') : t('welcomeBack')}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">{t('yourName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder={t('namePlaceholder')}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none transition bg-lemon/30 text-app-text"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-app-text mb-1">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="hello@example.com"
                className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none transition bg-lemon/30 text-app-text"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-app-text mb-1">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none transition bg-lemon/30 text-app-text"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">
                  {t('invitationCode')} <span className="text-app-text/40 font-normal">({t('invitationCodeHint')})</span>
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  placeholder={t('inviteCodePlaceholder')}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-lavender focus:border-primary outline-none transition bg-lemon/30 text-app-text uppercase tracking-widest"
                />
                <p className="text-xs text-app-text/40 mt-1">{t('invitationCodeNote')}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-lg shadow-md hover:bg-primary/80 transition disabled:opacity-50"
            >
              {loading ? t('loading') : isSignUp ? '🌟 ' + t('signUp') : '🚀 ' + t('login')}
            </button>
          </form>

          <p className="text-center mt-6 text-app-text/70">
            {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setInviteCode('') }}
              className="text-primary font-bold hover:underline"
            >
              {isSignUp ? t('login') : t('signUp')}
            </button>
          </p>
        </div>

        <p className="text-center text-app-text/50 text-sm mt-6">
          {t('carrotMotivation')}
        </p>
      </div>
    </div>
  )
}
