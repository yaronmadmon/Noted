import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Check if the path is a protected compile route (with any locale prefix)
  const localePattern = routing.locales.join('|')
  const isCompileRoute = new RegExp(`^/(${localePattern})/compile`).test(pathname)

  if (isCompileRoute) {
    let response = NextResponse.next({ request: req })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
            response = NextResponse.next({ request: req })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Extract locale from path and redirect to that locale's auth page
      const locale = routing.locales.find((l) => pathname.startsWith(`/${l}/`)) ?? routing.defaultLocale
      return NextResponse.redirect(new URL(`/${locale}/auth`, req.url))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|auth/callback|.*\\..*).*)'],
}
