'use client'

import { useTranslations } from 'next-intl'
import { IntentType } from '@/types'

const INTENT_VALUES: IntentType[] = ['study', 'business', 'book', 'content']
const INTENT_ICONS: Record<IntentType, string> = {
  study: '🎓',
  business: '💼',
  book: '📖',
  content: '✏️',
}

interface IntentEngineProps {
  selected: IntentType | null
  onSelect: (intent: IntentType) => void
}

export default function IntentEngine({ selected, onSelect }: IntentEngineProps) {
  const t = useTranslations('intent')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {INTENT_VALUES.map((value) => {
        const isSelected = selected === value
        return (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`text-left rounded-xl border-2 p-5 transition-all ${
              isSelected
                ? 'border-gray-900 bg-gray-900 text-white shadow-md scale-[1.02]'
                : 'border-gray-200 bg-white hover:border-gray-400 text-gray-900'
            }`}
          >
            <span className="text-2xl mb-2 block">{INTENT_ICONS[value]}</span>
            <p className="font-semibold text-sm mb-1">{t(value)}</p>
            <p className={`text-xs leading-relaxed ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
              {t(`${value}Desc`)}
            </p>
          </button>
        )
      })}
    </div>
  )
}
