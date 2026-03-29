'use client'

import { usePathname, useRouter } from '@/lib/navigation'
import { routing } from '@/i18n/routing'

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  zh: '中文',
  hi: 'हिन्दी',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  ru: 'Русский',
  de: 'Deutsch',
  ja: '日本語',
  he: 'עברית',
}

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <select
      value={currentLocale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
      aria-label="Select language"
    >
      {routing.locales.map((locale) => (
        <option key={locale} value={locale}>
          {LANG_NAMES[locale]}
        </option>
      ))}
    </select>
  )
}
