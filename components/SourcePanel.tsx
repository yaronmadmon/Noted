'use client'

import { useTranslations } from 'next-intl'

interface SourceFile {
  id: string
  file_name: string
  file_type: string
}

interface SourcePanelProps {
  sources: SourceFile[]
  activeSource: string | null
}

const FILE_TYPE_ICON: Record<string, string> = {
  image: '🖼',
  pdf: '📄',
  text: '📝',
  audio: '🎵',
}

export default function SourcePanel({ sources, activeSource }: SourcePanelProps) {
  const t = useTranslations('sourcePanel')

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        {t('title')}
      </h3>
      <ul className="space-y-2">
        {sources.map((source, i) => {
          const label = `SOURCE ${i + 1}`
          const isActive = activeSource === label
          return (
            <li
              key={source.id}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-base">{FILE_TYPE_ICON[source.file_type] ?? '📄'}</span>
              <div className="min-w-0">
                <p className={`text-xs font-semibold mb-0.5 ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                  {t('sourceLabel', { n: i + 1 })}
                </p>
                <p className={`text-sm truncate font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                  {source.file_name}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
