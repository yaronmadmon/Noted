'use client'

interface UsageBarProps {
  used: number
  limit: number
}

export default function UsageBar({ used, limit }: UsageBarProps) {
  const pct = Math.min((used / limit) * 100, 100)
  const remaining = limit - used
  const isNearLimit = remaining <= 3
  const isAtLimit = remaining === 0

  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-500">Monthly compilations</span>
        <span className={`text-xs font-semibold ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-gray-700'}`}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-400' : 'bg-gray-900'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-xs text-red-500 mt-1.5">Limit reached — resets next month</p>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-amber-500 mt-1.5">{remaining} compilation{remaining !== 1 ? 's' : ''} remaining</p>
      )}
    </div>
  )
}
