'use client'

import { IntentType } from '@/types'

interface IntentCard {
  value: IntentType
  icon: string
  title: string
  description: string
}

const CARDS: IntentCard[] = [
  {
    value: 'study',
    icon: '🎓',
    title: 'Study Guide',
    description: 'Turns notes into study guides, summaries, and exam prep materials',
  },
  {
    value: 'business',
    icon: '💼',
    title: 'Business',
    description: 'Converts research into reports, proposals, and executive briefs',
  },
  {
    value: 'book',
    icon: '📖',
    title: 'Book',
    description: 'Structures notes into chapters, outlines, and manuscript drafts',
  },
  {
    value: 'content',
    icon: '✏️',
    title: 'Content',
    description: 'Transforms ideas into blog posts, scripts, and course outlines',
  },
]

interface IntentEngineProps {
  selected: IntentType | null
  onSelect: (intent: IntentType) => void
}

export default function IntentEngine({ selected, onSelect }: IntentEngineProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {CARDS.map(({ value, icon, title, description }) => {
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
            <span className="text-2xl mb-2 block">{icon}</span>
            <p className="font-semibold text-sm mb-1">{title}</p>
            <p className={`text-xs leading-relaxed ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
              {description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
