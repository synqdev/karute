'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: '◻' },
  { href: '/customers', label: '顧客', icon: '◻' },
  { href: '/appointments', label: '予約', icon: '◻' },
  { href: '/karute', label: 'カルテ', icon: '◻' },
  { href: '/recording', label: '録音', icon: '◻' },
  { href: '/ask-ai', label: 'AI に聞く', icon: '◻' },
  { href: '/migration', label: 'データ移行', icon: '◻' },
  { href: '/settings', label: '設定', icon: '◻' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-card transition-all duration-200',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="text-lg font-bold tracking-wide">
          {collapsed ? 'K' : 'Karute'}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50"
        >
          {collapsed ? '→' : '← 閉じる'}
        </button>
      </div>
    </aside>
  )
}
