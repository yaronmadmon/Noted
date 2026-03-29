'use client'

import { CompilationOutput } from '@/types'

interface CompilationResultProps {
  output: CompilationOutput
  isLoading?: boolean
}

export default function CompilationResult({ output, isLoading }: CompilationResultProps) {
  if (isLoading) {
    return (
      <div className="mt-10 space-y-4 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-2/3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-10 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{output.title}</h2>
      <p className="text-gray-500 text-sm mb-8 pb-6 border-b border-gray-100">
        {output.summary}
      </p>

      <div className="space-y-8">
        {output.sections.map((section, i) => (
          <div key={i}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {section.heading}
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {section.content}
            </p>
            {section.sourceRefs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {section.sourceRefs.map((ref, j) => (
                  <span
                    key={j}
                    className="inline-block text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
