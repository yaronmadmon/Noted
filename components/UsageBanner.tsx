'use client'

import { useTranslations } from 'next-intl'

interface UsageBannerProps {
  used: number
  limit: number
}

export default function UsageBanner({ used, limit }: UsageBannerProps) {
  const t = useTranslations('usage')
  const pct = Math.min((used / limit) * 100, 100)
  const remaining = limit - used
  const atLimit = remaining <= 0
  const nearLimit = !atLimit && pct >= 80

  return (
    <div
      className={`rounded-xl border px-5 py-4 mb-8 ${
        atLimit
          ? 'bg-red-50 border-red-200'
          : nearLimit
          ? 'bg-amber-50 border-amber-200'
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-medium ${atLimit ? 'text-red-700' : nearLimit ? 'text-amber-700' : 'text-gray-700'}`}>
          {atLimit ? t('allUsed', { limit }) : t('used', { used, limit })}
        </p>
        {atLimit && (
          <button className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
            {t('upgrade')}
          </button>
        )}
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            atLimit ? 'bg-red-500' : nearLimit ? 'bg-amber-400' : 'bg-gray-900'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {nearLimit && !atLimit && (
        <p className="text-xs text-amber-600 mt-1.5">
          {t('nearLimit', { remaining })}
        </p>
      )}
    </div>
  )
}
