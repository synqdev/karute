'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

const PROFILES = [
  { name: 'Anthony', email: 'anthony@karute.test', initials: 'AL', color: 'bg-teal-500' },
  { name: 'Jon', email: 'jon@karute.test', initials: 'JC', color: 'bg-blue-500' },
  { name: 'Liam', email: 'liam@karute.test', initials: 'LM', color: 'bg-amber-500' },
]

export default function LoginPage() {
  const [signingIn, setSigningIn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const t = useTranslations('auth')

  async function handleProfileClick(profile: (typeof PROFILES)[number]) {
    setError(null)
    setSigningIn(profile.email)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: 'test123',
      })

      if (error) {
        setError(t('invalidCredentials'))
        setSigningIn(null)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(t('loginError'))
      setSigningIn(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#141414] px-4">
      {/* Brand */}
      <h1 className="mb-2 text-5xl font-bold tracking-tight text-white">
        Karute
      </h1>
      <p className="mb-12 text-sm text-white/40">
        {t('subtitle')}
      </p>

      {/* Who's using */}
      <h2 className="mb-10 text-2xl font-medium text-white/90">
        {t('whosUsing')}
      </h2>

      {/* Profile cards */}
      <div className="flex gap-8">
        {PROFILES.map((profile) => {
          const isLoading = signingIn === profile.email
          return (
            <button
              key={profile.email}
              type="button"
              onClick={() => handleProfileClick(profile)}
              disabled={signingIn !== null}
              className="group flex flex-col items-center gap-3 disabled:opacity-60"
            >
              <div
                className={`relative flex h-[140px] w-[140px] items-center justify-center rounded-md ${profile.color} text-white transition-all group-hover:ring-4 group-hover:ring-white/80 ${
                  isLoading ? 'ring-4 ring-white/80' : ''
                }`}
              >
                {isLoading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                ) : (
                  <span className="text-4xl font-bold">{profile.initials}</span>
                )}
              </div>
              <span className="text-sm text-neutral-400 transition group-hover:text-white">
                {profile.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-8 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}
