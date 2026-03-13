import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Extract locale prefix from pathname (e.g. /ja/dashboard -> ja)
  const pathname = request.nextUrl.pathname
  const localeMatch = pathname.match(/^\/(ja|en)/)
  const locale = localeMatch ? localeMatch[1] : 'ja'
  const pathWithoutLocale = localeMatch
    ? pathname.slice(locale.length + 1) || '/'
    : pathname

  // Allow free tier recording page without auth
  if (pathWithoutLocale.startsWith('/record')) {
    return supabaseResponse
  }

  // Redirect unauthenticated users to login
  if (
    !user &&
    !pathWithoutLocale.startsWith('/login') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login
  if (user && pathWithoutLocale.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/dashboard`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
