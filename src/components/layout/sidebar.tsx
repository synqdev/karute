'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useRecordPanel } from '@/components/providers/record-panel-provider'
import { useAskAiPanel } from '@/components/providers/ask-ai-panel-provider'

function SvgIcon({ d, className = 'h-7 w-7' }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  )
}

const NAV_ICONS: Record<string, string> = {
  recording: 'M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4Zm-6 9a1 1 0 0 1 1 1 5 5 0 0 0 10 0 1 1 0 0 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11a1 1 0 0 1 1-1Z',
  karute: 'M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 5.9l1.8 1.8a1 1 0 0 1-1.4 1.4l-1.8-1.8A7 7 0 0 1 5 9a7 7 0 0 1 7-7Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-3.5 4.3 7-2.8a.8.8 0 0 1 .6 1.5l-7 2.8a.8.8 0 1 1-.6-1.5ZM6.5 19.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z',
  dashboard: 'M12 3 2.5 10.8h2.2V21h6.1v-6.3h2.4V21h6.1V10.8h2.2Z',
  customers: 'M12 2.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM4 21.5a8 8 0 0 1 16 0z',
  aiCharts: 'M3 20.5h18v1.5H3zM5 11h3v8H5zm5-5h3v13h-3zm5 3h3v10h-3z',
  migration: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
  askAi: 'M12 3.2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 10.8c4.9 0 8.6 2.8 9.7 7.1.2.7-.3 1.3-1 1.3H3.3c-.7 0-1.2-.6-1-1.3C3.4 16.8 7.1 14 12 14Z',
  settings: 'M10.6 2h2.8l.5 2a8 8 0 0 1 1.8.8l1.8-1.1 2 2-1.1 1.8c.3.6.6 1.2.8 1.8l2 .5v2.8l-2 .5a8 8 0 0 1-.8 1.8l1.1 1.8-2 2-1.8-1.1a8 8 0 0 1-1.8.8l-.5 2h-2.8l-.5-2a8 8 0 0 1-1.8-.8L6 19.8l-2-2 1.1-1.8a8 8 0 0 1-.8-1.8l-2-.5V10.9l2-.5c.2-.6.5-1.2.8-1.8L4 6.8l2-2 1.8 1.1c.6-.3 1.2-.6 1.8-.8Zm1.4 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
}

interface NavRoute {
  id: string
  href: string
  labelKey: string
  iconKey: string
}

const NAV_ROUTES: NavRoute[] = [
  { id: 'record', href: '/record', labelKey: 'recording', iconKey: 'recording' },
  { id: 'dashboard', href: '/dashboard', labelKey: 'dashboard', iconKey: 'dashboard' },
  { id: 'customers', href: '/customers', labelKey: 'customers', iconKey: 'customers' },
  { id: 'karute', href: '/karute', labelKey: 'karute', iconKey: 'karute' },
  { id: 'migration', href: '/migration', labelKey: 'migration', iconKey: 'migration' },
  { id: 'askAi', href: '/ask-ai', labelKey: 'askAi', iconKey: 'askAi' },
  { id: 'settings', href: '/settings', labelKey: 'settings', iconKey: 'settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('sidebar')
  const { open: recordOpen, setOpen: setRecordOpen } = useRecordPanel()
  const { open: askAiOpen, setOpen: setAskAiOpen } = useAskAiPanel()

  const activeId = NAV_ROUTES.find((r) => pathname.startsWith(r.href))?.id ?? 'dashboard'

  function handleNav(route: NavRoute) {
    if (route.id === 'record') {
      setAskAiOpen(false)
      setRecordOpen(!recordOpen)
      return
    }
    if (route.id === 'askAi') {
      setRecordOpen(false)
      setAskAiOpen(!askAiOpen)
      return
    }
    router.push(route.href as Parameters<typeof router.push>[0])
  }

  return (
    <aside className="flex h-full w-[90px] shrink-0 flex-col items-center rounded-[28px] bg-[#4a4a4a] py-4 text-white">
      {NAV_ROUTES.map((route) => {
        const active = route.id === activeId
        return (
          <button
            key={route.id}
            type="button"
            onClick={() => handleNav(route)}
            className={`flex w-full flex-col items-center gap-1 px-2 py-3 transition ${
              active ? 'text-white' : 'text-white/60 hover:text-white/90'
            }`}
            title={t(route.labelKey as Parameters<typeof t>[0])}
          >
            <SvgIcon d={NAV_ICONS[route.iconKey]} className="h-7 w-7" />
            <span className="text-[10px] font-medium leading-tight">
              {t(route.labelKey as Parameters<typeof t>[0])}
            </span>
          </button>
        )
      })}

    </aside>
  )
}
