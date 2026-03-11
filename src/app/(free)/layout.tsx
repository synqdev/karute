import Link from 'next/link'

export default function FreeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link
            href="/record"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            Karute
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ログイン
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
