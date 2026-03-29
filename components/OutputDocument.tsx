'use client'

import { CompilationOutput } from '@/types'

interface OutputDocumentProps {
  output: CompilationOutput
  activeSource: string | null
  onSourceClick: (ref: string) => void
}

export default function OutputDocument({
  output,
  activeSource,
  onSourceClick,
}: OutputDocumentProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{output.title}</h1>

      {/* Summary */}
      {output.summary && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Summary</p>
          <p className="text-gray-700 text-sm leading-relaxed">{output.summary}</p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-8">
        {output.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{section.heading}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
              {section.content}
            </p>

            {/* Source ref badges */}
            {section.sourceRefs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {section.sourceRefs.map((ref, j) => (
                  <button
                    key={j}
                    onClick={() => onSourceClick(ref)}
                    className={`inline-block text-xs rounded-full px-2.5 py-0.5 border transition-colors ${
                      activeSource === ref
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {ref}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
