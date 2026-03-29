import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { getCurrentUser } from '@/lib/auth'
import NavSignOut from '@/components/NavSignOut'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Link } from '@/lib/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Knowledge Compiler',
  description: 'Turn messy notes into finished work',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const RTL_LOCALES = ['he']

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()
  const t = await getTranslations({ locale, namespace: 'nav' })
  const user = await getCurrentUser()
  const isRTL = RTL_LOCALES.includes(locale)

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <nav className="border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-3">
              <Link href="/" className="text-base sm:text-lg font-semibold text-gray-900 shrink-0">
                {t('brand')}
              </Link>
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <LanguageSwitcher currentLocale={locale} />
                {user ? (
                  <>
                    <span className="hidden sm:block text-sm text-gray-400 truncate max-w-[160px]">{user.email}</span>
                    <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      {t('dashboard')}
                    </Link>
                    <Link href="/compile" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      {t('compile')}
                    </Link>
                    <NavSignOut />
                  </>
                ) : (
                  <Link href="/auth" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    {t('signIn')}
                  </Link>
                )}
              </div>
            </div>
          </nav>
          <main className="min-h-screen bg-gray-50">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
