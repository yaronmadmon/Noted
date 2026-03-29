'use client'

import { useTranslations } from 'next-intl'
import { OutputTemplate } from '@/lib/templates'

interface TemplateSelectorProps {
  templates: OutputTemplate[]
  selected: string | null
  onSelect: (templateId: string | null) => void
}

export default function TemplateSelector({
  templates,
  selected,
  onSelect,
}: TemplateSelectorProps) {
  const t = useTranslations('template')
  if (templates.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {t('heading')} <span className="normal-case font-normal text-gray-400">{t('optional')}</span>
        </h2>
        {selected && (
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            {t('clear')}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {templates.map((tpl) => {
          const isSelected = selected === tpl.id
          return (
            <button
              key={tpl.id}
              onClick={() => onSelect(isSelected ? null : tpl.id)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                isSelected
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white hover:border-gray-400 text-gray-900'
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-semibold">{tpl.label}</p>
                  <p className={`text-xs shrink-0 mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                    {tpl.sections.join(' · ')}
                  </p>
                </div>
                <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                  {tpl.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
