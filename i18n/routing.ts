import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'zh', 'hi', 'es', 'fr', 'pt', 'ru', 'de', 'ja', 'he'],
  defaultLocale: 'en',
})
