'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from '@/lib/navigation'
import { useTranslations } from 'next-intl'

export default function NavSignOut() {
  const router = useRouter()
  const t = useTranslations('nav')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
    >
      {t('signOut')}
    </button>
  )
}
