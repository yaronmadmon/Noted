import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getUserUsage } from '@/lib/usage'
import { supabaseAdmin } from '@/lib/supabaseServer'
import UsageBanner from '@/components/UsageBanner'
import { IntentType } from '@/types'

const INTENT_LABELS: Record<IntentType, string> = {
  study: 'Study Guide',
  business: 'Business Brief',
  book: 'Book / Article',
  content: 'Content',
}

const INTENT_ICONS: Record<IntentType, string> = {
  study: '🎓',
  business: '💼',
  book: '📖',
  content: '✏️',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')

  const [usage, { data: compilations }] = await Promise.all([
    getUserUsage(user.id),
    supabaseAdmin
      .from('compilations')
      .select('id, intent, status, output, created_at')
      .eq('user_id', user.id)
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/compile"
          className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + New compilation
        </Link>
      </div>

      <UsageBanner used={usage.used} limit={usage.limit} />

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Past compilations
      </h2>

      {!compilations?.length ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No compilations yet.</p>
          <Link href="/compile" className="mt-3 inline-block text-sm text-gray-700 underline underline-offset-2">
            Create your first one
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {compilations.map((c) => {
            const intent = c.intent as IntentType
            const title = c.output?.title ?? 'Untitled'
            return (
              <li key={c.id}>
                <Link
                  href={`/compile/${c.id}`}
                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-5 py-4 hover:border-gray-300 transition-colors"
                >
                  <span className="text-2xl">{INTENT_ICONS[intent] ?? '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{INTENT_LABELS[intent]}</p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{formatDate(c.created_at)}</p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
