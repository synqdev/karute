'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon, ChevronDown, LogOut } from 'lucide-react'
import { useOrg } from '@/components/providers/org-provider'
import { createClient } from '@/lib/supabase/client'

export function TopBar() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('sidebar')
  const { theme, setTheme } = useTheme()
  const { staff, allStaff, switchStaff } = useOrg()
  const [staffOpen, setStaffOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function toggleLocale() {
    const next = locale === 'ja' ? 'en' : 'ja'
    router.replace(pathname as Parameters<typeof router.replace>[0], { locale: next })
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStaffOpen(false)
      }
    }
    if (staffOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [staffOpen])

  return (
    <div className="flex items-center gap-3">
      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-full p-2 text-neutral-500 transition hover:text-neutral-800 dark:text-white/70 dark:hover:text-white"
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Locale toggle */}
      <button
        type="button"
        onClick={toggleLocale}
        className="rounded-full px-2 py-1 text-sm font-bold text-neutral-500 transition hover:text-neutral-800 dark:text-white/70 dark:hover:text-white"
      >
        {locale === 'ja' ? 'JP' : 'EN'}/{locale === 'ja' ? 'EN' : 'JP'}
      </button>

      {/* Staff switcher + logout */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setStaffOpen(!staffOpen)}
          className="flex items-center gap-2 rounded-full bg-neutral-200 py-1 pl-1 pr-3 transition hover:bg-neutral-300 dark:bg-white/15 dark:hover:bg-white/20"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-400 text-xs font-bold text-white dark:bg-white/30">
            {staff.initials}
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-white/80">
            {staff.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-500 dark:text-white/50" />
        </button>

        {staffOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#2a2a2a]">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/40">
              Switch Staff
            </div>
            {allStaff.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  switchStaff(s.id)
                  setStaffOpen(false)
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-white/10 ${
                  s.id === staff.id ? 'bg-neutral-100 dark:bg-white/10' : ''
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-xs font-bold text-neutral-700 dark:bg-white/20 dark:text-white/80">
                  {s.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-neutral-800 dark:text-white/90">{s.name}</p>
                  <p className="text-[11px] text-neutral-400 dark:text-white/40">{s.role}</p>
                </div>
                {s.id === staff.id && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-teal-500" />
                )}
              </button>
            ))}

            {/* Divider + Logout */}
            <div className="border-t border-neutral-200 dark:border-white/10" />
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              <span>{loggingOut ? '...' : t('logout' as Parameters<typeof t>[0])}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
